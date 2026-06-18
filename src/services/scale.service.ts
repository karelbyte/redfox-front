/**
 * Scale Service - Web Serial API
 * 
 * Servicio para comunicación con básculas comerciales via puerto serial.
 * Compatible con la mayoría de básculas que envían datos por RS-232/USB-Serial
 * (Torrey, Ohaus, CAS, Toledo, Digi, etc.)
 * 
 * Formatos de respuesta comunes que este parser soporta:
 *   - "ST,GS,  0.450,kg\r\n"  (estándar Ohaus/Toledo)
 *   - "  0.450 kg\r\n"         (formato simple)
 *   - "+  0.450 kg\r\n"        (con signo)
 *   - "0.450\r\n"              (solo número)
 *   - "ST,NT,  0.450,kg\r\n"  (net weight)
 *   - "US,GS,  0.992,lb\r\n"  (unstable reading)
 */

export type ScaleUnit = 'kg' | 'lb' | 'g' | 'oz' | 'unknown';

export type ScaleStatus = 'stable' | 'unstable' | 'overload' | 'underload' | 'unknown';

export interface ScaleReading {
  weight: number;
  unit: ScaleUnit;
  status: ScaleStatus;
  raw: string;
  timestamp: number;
}

export interface ScaleConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
  /** Comando para solicitar peso (algunas básculas requieren enviar un caracter para que respondan) */
  requestCommand?: string;
  /** Timeout en ms para esperar respuesta */
  readTimeout: number;
  /** Caracter(es) terminador de línea */
  lineEnding: string;
}

export const DEFAULT_SCALE_CONFIG: ScaleConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none',
  requestCommand: undefined,
  readTimeout: 3000,
  lineEnding: '\r\n',
};

/** Configuraciones preestablecidas para marcas populares */
export const SCALE_PRESETS: Record<string, Partial<ScaleConfig>> = {
  generic: {},
  torrey: { baudRate: 9600, dataBits: 8, parity: 'none' },
  ohaus: { baudRate: 9600, dataBits: 7, parity: 'even', requestCommand: 'P\r\n' },
  cas: { baudRate: 9600, dataBits: 8, parity: 'none' },
  toledo: { baudRate: 9600, dataBits: 7, parity: 'odd', requestCommand: 'W\r\n' },
  digi: { baudRate: 9600, dataBits: 8, parity: 'none' },
};

type ScaleEventType = 'reading' | 'connected' | 'disconnected' | 'error';
type ScaleEventListener = (data: any) => void;

class ScaleService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private config: ScaleConfig = { ...DEFAULT_SCALE_CONFIG };
  private connected = false;
  private reading = false;
  private buffer = '';
  private listeners: Map<ScaleEventType, Set<ScaleEventListener>> = new Map();
  private lastReading: ScaleReading | null = null;
  private abortController: AbortController | null = null;

  /** Verifica si el navegador soporta Web Serial API */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  /** Verifica si la báscula está conectada */
  isConnected(): boolean {
    return this.connected;
  }

  /** Obtiene la última lectura */
  getLastReading(): ScaleReading | null {
    return this.lastReading;
  }

  /** Configura los parámetros de conexión */
  setConfig(config: Partial<ScaleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Aplica un preset de marca */
  applyPreset(presetName: string): void {
    const preset = SCALE_PRESETS[presetName];
    if (preset) {
      this.config = { ...DEFAULT_SCALE_CONFIG, ...preset };
    }
  }

  /** Obtiene la configuración actual */
  getConfig(): ScaleConfig {
    return { ...this.config };
  }

  /**
   * Conectar a la báscula.
   * Abre el diálogo del navegador para seleccionar el puerto serial.
   */
  async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.emit('error', { message: 'Web Serial API no está soportada en este navegador. Usa Chrome o Edge.' });
      return false;
    }

    if (this.connected) {
      return true;
    }

    try {
      // Solicitar puerto al usuario
      this.port = await navigator.serial.requestPort();

      // Abrir con la configuración
      await this.port.open({
        baudRate: this.config.baudRate,
        dataBits: this.config.dataBits,
        stopBits: this.config.stopBits,
        parity: this.config.parity,
        flowControl: this.config.flowControl,
      });

      this.connected = true;
      this.emit('connected', { port: this.port.getInfo() });

      return true;
    } catch (error: any) {
      // El usuario canceló el diálogo o hubo un error
      if (error.name === 'NotFoundError') {
        // Usuario canceló — no es un error real
        return false;
      }

      this.emit('error', { message: `Error al conectar: ${error.message}`, error });
      return false;
    }
  }

  /** Desconectar de la báscula */
  async disconnect(): Promise<void> {
    this.reading = false;

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // Ignorar errores al cancelar
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignorar errores al cerrar
      }
      this.port = null;
    }

    this.connected = false;
    this.buffer = '';
    this.emit('disconnected', {});
  }

  /**
   * Lee un único peso de la báscula.
   * Si la báscula requiere comando de solicitud, lo envía primero.
   * Retorna null si no se pudo leer en el timeout configurado.
   */
  async readWeight(): Promise<ScaleReading | null> {
    if (!this.connected || !this.port) {
      this.emit('error', { message: 'Báscula no conectada' });
      return null;
    }

    try {
      // Si la báscula requiere comando de solicitud, enviarlo
      if (this.config.requestCommand && this.port.writable) {
        const writer = this.port.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(this.config.requestCommand));
        writer.releaseLock();
      }

      // Leer respuesta
      const response = await this.readLine();
      if (!response) {
        return null;
      }

      const reading = this.parseReading(response);
      if (reading) {
        this.lastReading = reading;
        this.emit('reading', reading);
      }

      return reading;
    } catch (error: any) {
      this.emit('error', { message: `Error al leer peso: ${error.message}`, error });
      return null;
    }
  }

  /**
   * Inicia lectura continua de la báscula.
   * Emite eventos 'reading' cada vez que hay una nueva lectura.
   */
  async startContinuousReading(): Promise<void> {
    if (!this.connected || !this.port || this.reading) {
      return;
    }

    this.reading = true;
    this.abortController = new AbortController();

    try {
      while (this.reading && this.port?.readable) {
        const reader = this.port.readable.getReader();
        this.reader = reader;

        try {
          while (this.reading) {
            const { value, done } = await reader.read();
            if (done) break;

            if (value) {
              const decoder = new TextDecoder();
              this.buffer += decoder.decode(value, { stream: true });

              // Procesar líneas completas en el buffer
              let lineEnd = this.buffer.indexOf(this.config.lineEnding);
              while (lineEnd !== -1) {
                const line = this.buffer.substring(0, lineEnd).trim();
                this.buffer = this.buffer.substring(lineEnd + this.config.lineEnding.length);

                if (line.length > 0) {
                  const reading = this.parseReading(line);
                  if (reading) {
                    this.lastReading = reading;
                    this.emit('reading', reading);
                  }
                }

                lineEnd = this.buffer.indexOf(this.config.lineEnding);
              }
            }
          }
        } finally {
          reader.releaseLock();
          this.reader = null;
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.emit('error', { message: `Error en lectura continua: ${error.message}`, error });
      }
    } finally {
      this.reading = false;
    }
  }

  /** Detiene la lectura continua */
  stopContinuousReading(): void {
    this.reading = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /** Suscribirse a eventos */
  on(event: ScaleEventType, listener: ScaleEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Retorna función de unsubscribe
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /** Emitir evento */
  private emit(event: ScaleEventType, data: any): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in scale event listener (${event}):`, error);
      }
    });
  }

  /** Lee una línea completa del puerto serial con timeout */
  private async readLine(): Promise<string | null> {
    if (!this.port?.readable) return null;

    const reader = this.port.readable.getReader();
    this.reader = reader;
    const decoder = new TextDecoder();
    let localBuffer = this.buffer;

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), this.config.readTimeout);
    });

    const readPromise = (async (): Promise<string | null> => {
      try {
        while (true) {
          const lineEnd = localBuffer.indexOf(this.config.lineEnding);
          if (lineEnd !== -1) {
            const line = localBuffer.substring(0, lineEnd).trim();
            this.buffer = localBuffer.substring(lineEnd + this.config.lineEnding.length);
            return line || null;
          }

          const { value, done } = await reader.read();
          if (done) return null;

          if (value) {
            localBuffer += decoder.decode(value, { stream: true });
          }
        }
      } finally {
        reader.releaseLock();
        this.reader = null;
      }
    })();

    const result = await Promise.race([readPromise, timeoutPromise]);
    
    if (result === null && localBuffer.length > 0) {
      // Timeout pero hay datos parciales, intentar parsear
      this.buffer = '';
      const trimmed = localBuffer.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    return result;
  }

  /**
   * Parsea la respuesta de la báscula.
   * Soporta múltiples formatos comunes de básculas comerciales.
   */
  private parseReading(raw: string): ScaleReading | null {
    if (!raw || raw.length === 0) return null;

    const cleaned = raw.trim();

    // Detectar estado
    let status: ScaleStatus = 'unknown';
    if (/^ST/i.test(cleaned) || /stable/i.test(cleaned)) {
      status = 'stable';
    } else if (/^US/i.test(cleaned) || /unstable|motion/i.test(cleaned)) {
      status = 'unstable';
    } else if (/^OL/i.test(cleaned) || /over/i.test(cleaned)) {
      status = 'overload';
    } else if (/^UL/i.test(cleaned) || /under/i.test(cleaned)) {
      status = 'underload';
    }

    // Detectar unidad
    let unit: ScaleUnit = 'unknown';
    if (/kg/i.test(cleaned)) unit = 'kg';
    else if (/\blb\b/i.test(cleaned)) unit = 'lb';
    else if (/\bg\b/i.test(cleaned) && !/kg/i.test(cleaned)) unit = 'g';
    else if (/oz/i.test(cleaned)) unit = 'oz';

    // Extraer valor numérico
    // Buscar patrón numérico: signo opcional, espacios, dígitos con punto decimal
    const numberMatch = cleaned.match(/[+-]?\s*\d+\.?\d*/);
    if (!numberMatch) return null;

    const weight = parseFloat(numberMatch[0].replace(/\s/g, ''));
    if (isNaN(weight)) return null;

    // Si no se detectó estado pero hay un número válido, asumir estable
    if (status === 'unknown' && weight >= 0) {
      status = 'stable';
    }

    // Si no se detectó unidad, asumir kg (la más común en México/Latam)
    if (unit === 'unknown') {
      unit = 'kg';
    }

    return {
      weight,
      unit,
      status,
      raw: cleaned,
      timestamp: Date.now(),
    };
  }
}

export const scaleService = new ScaleService();
