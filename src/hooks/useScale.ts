'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { scaleService, ScaleReading, ScaleConfig, SCALE_PRESETS } from '@/services/scale.service';

export interface UseScaleOptions {
  /** Si true, inicia lectura continua al conectar */
  continuous?: boolean;
  /** Preset de marca de báscula */
  preset?: string;
  /** Configuración manual (sobreescribe preset) */
  config?: Partial<ScaleConfig>;
}

export interface UseScaleReturn {
  /** Último peso leído */
  weight: number | null;
  /** Última lectura completa (peso, unidad, estado, raw) */
  lastReading: ScaleReading | null;
  /** Si la báscula está conectada */
  isConnected: boolean;
  /** Si hay una lectura en curso */
  isReading: boolean;
  /** Si el navegador soporta Web Serial */
  isSupported: boolean;
  /** Mensaje de error (se limpia al reconectar) */
  error: string | null;
  /** Conectar a la báscula (abre diálogo del navegador) */
  connect: () => Promise<boolean>;
  /** Desconectar la báscula */
  disconnect: () => Promise<void>;
  /** Leer peso una vez (bajo demanda) */
  readWeight: () => Promise<number | null>;
  /** Iniciar lectura continua */
  startContinuous: () => void;
  /** Detener lectura continua */
  stopContinuous: () => void;
  /** Cambiar preset de báscula */
  setPreset: (preset: string) => void;
  /** Lista de presets disponibles */
  availablePresets: string[];
}

export function useScale(options: UseScaleOptions = {}): UseScaleReturn {
  const { continuous = false, preset, config } = options;

  const [weight, setWeight] = useState<number | null>(null);
  const [lastReading, setLastReading] = useState<ScaleReading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continuousRef = useRef(continuous);
  continuousRef.current = continuous;

  const isSupported = typeof window !== 'undefined' ? scaleService.isSupported() : false;

  // Aplicar config inicial
  useEffect(() => {
    if (preset) {
      scaleService.applyPreset(preset);
    }
    if (config) {
      scaleService.setConfig(config);
    }
  }, [preset, config]);

  // Suscribirse a eventos del servicio
  useEffect(() => {
    const unsubReading = scaleService.on('reading', (reading: ScaleReading) => {
      setWeight(reading.weight);
      setLastReading(reading);
    });

    const unsubConnected = scaleService.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    const unsubDisconnected = scaleService.on('disconnected', () => {
      setIsConnected(false);
      setIsReading(false);
      setWeight(null);
    });

    const unsubError = scaleService.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    // Sincronizar estado inicial
    setIsConnected(scaleService.isConnected());
    const currentReading = scaleService.getLastReading();
    if (currentReading) {
      setWeight(currentReading.weight);
      setLastReading(currentReading);
    }

    return () => {
      unsubReading();
      unsubConnected();
      unsubDisconnected();
      unsubError();
    };
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    setError(null);
    const success = await scaleService.connect();

    if (success && continuousRef.current) {
      setIsReading(true);
      scaleService.startContinuousReading();
    }

    return success;
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    scaleService.stopContinuousReading();
    await scaleService.disconnect();
    setWeight(null);
    setLastReading(null);
    setIsReading(false);
  }, []);

  const readWeight = useCallback(async (): Promise<number | null> => {
    setError(null);
    setIsReading(true);

    try {
      const reading = await scaleService.readWeight();
      return reading?.weight ?? null;
    } finally {
      setIsReading(false);
    }
  }, []);

  const startContinuous = useCallback(() => {
    if (isConnected) {
      setIsReading(true);
      scaleService.startContinuousReading();
    }
  }, [isConnected]);

  const stopContinuous = useCallback(() => {
    scaleService.stopContinuousReading();
    setIsReading(false);
  }, []);

  const setPreset = useCallback((newPreset: string) => {
    scaleService.applyPreset(newPreset);
  }, []);

  const availablePresets = Object.keys(SCALE_PRESETS);

  return {
    weight,
    lastReading,
    isConnected,
    isReading,
    isSupported,
    error,
    connect,
    disconnect,
    readWeight,
    startContinuous,
    stopContinuous,
    setPreset,
    availablePresets,
  };
}
