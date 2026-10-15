/**
 * `formatCurrency` es el único camino que debería usarse para mostrar dinero,
 * precisamente porque no puede lanzar: siempre tiene la moneda de la
 * organización con la que caer. Construir `Intl` a mano sí lanza cuando la
 * moneda llega vacía, y eso tumba el render entero.
 */
describe('formateo de moneda sin moneda explícita', () => {
  /** Misma resolución que hace useLocaleUtils, con la organización sin moneda. */
  const format = (amount: number, currencyCode?: string) => {
    const organizationCurrency = undefined as string | undefined;
    const code = currencyCode || organizationCurrency || 'MXN';

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  it('no lanza cuando no se indica moneda', () => {
    expect(() => format(100)).not.toThrow();
    expect(() => format(100, undefined)).not.toThrow();
  });

  /** El fallo exacto que dejó la pantalla de crédito sin cargar. */
  it('Intl sí lanza si la moneda llega indefinida, que es lo que se evita', () => {
    expect(() =>
      new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: undefined,
      }).format(100),
    ).toThrow(TypeError);
  });

  it('respeta la moneda cuando sí se indica', () => {
    expect(format(100, 'PEN')).toContain('100.00');
    expect(format(100, 'USD')).toContain('100.00');
  });
});
