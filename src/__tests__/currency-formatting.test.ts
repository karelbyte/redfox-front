import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * `Intl.NumberFormat` con `style: 'currency'` lanza un TypeError si la moneda
 * llega indefinida, y en un componente eso tumba el render entero: la
 * pantalla de crédito de cliente quedó en "This page couldn't load" por
 * exactamente eso, después de sustituir un respaldo fijo por `undefined`.
 *
 * Esa sustitución es correcta al llamar a `formatCurrency`, que resuelve la
 * moneda de la organización por dentro, y es un fallo al construir `Intl` a
 * mano. Lo que se vigila aquí es la segunda forma.
 */
const PELIGRO = /currency:\s*[^,'"`\n][^,\n]*\|\|\s*undefined/;

describe('formateo de moneda', () => {
  /** Recorre src/ sin depender de un glob, que cambia de sitio entre versiones. */
  const sourceFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        return entry.name === '__tests__' ? [] : sourceFiles(path);
      }

      return /\.tsx?$/.test(entry.name) ? [path] : [];
    });

  const archivos = sourceFiles('src');

  it('encuentra archivos que revisar', () => {
    expect(archivos.length).toBeGreaterThan(50);
  });

  it('ninguna opción `currency` de Intl puede quedar en undefined', () => {
    const culpables = archivos.filter((ruta) =>
      PELIGRO.test(readFileSync(ruta, 'utf8')),
    );

    expect(culpables).toEqual([]);
  });
});
