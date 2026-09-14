import { http, HttpResponse } from 'msw';
import { productService } from '../products.service';
import { server } from '../../__mocks__/server';

// El cliente HTTP antepone la URL base de la API, así que los manejadores
// aceptan cualquier origen.
const PRODUCTS = '*/api/products';

const product = {
  id: 'prod-1',
  name: 'Teclado mecánico',
  sku: 'TEC-001',
  description: 'Teclado mecánico retroiluminado',
};

const paginated = {
  data: [product],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

/** Captura la URL que recibe el servidor para comprobar cómo se construye. */
function captureUrl(path: string, body: object = paginated) {
  const seen: { url?: string } = {};

  server.use(
    http.get(path, ({ request }) => {
      seen.url = request.url;
      return HttpResponse.json(body);
    }),
  );

  return seen;
}

describe('productService', () => {
  describe('getProducts', () => {
    it('devuelve la página de productos', async () => {
      server.use(http.get(PRODUCTS, () => HttpResponse.json(paginated)));

      const result = await productService.getProducts();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Teclado mecánico');
      expect(result.meta.total).toBe(1);
    });

    it('no envía parámetros cuando no se indican', async () => {
      const seen = captureUrl(PRODUCTS);

      await productService.getProducts();

      expect(seen.url).not.toContain('?');
    });

    it('traslada página, término, estado y tipo a la consulta', async () => {
      const seen = captureUrl(PRODUCTS);

      await productService.getProducts(2, 'teclado', false, 'TANGIBLE');

      const query = new URL(seen.url as string).searchParams;
      expect(query.get('page')).toBe('2');
      expect(query.get('term')).toBe('teclado');
      expect(query.get('is_active')).toBe('false');
      expect(query.get('type')).toBe('TANGIBLE');
    });

    it('admite un resultado vacío', async () => {
      server.use(
        http.get(PRODUCTS, () =>
          HttpResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
          }),
        ),
      );

      const result = await productService.getProducts(1, 'no-existe');

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('propaga el mensaje de error de la API', async () => {
      server.use(
        http.get(PRODUCTS, () =>
          HttpResponse.json({ message: 'Parámetros inválidos' }, { status: 400 }),
        ),
      );

      await expect(productService.getProducts()).rejects.toThrow(
        'Parámetros inválidos',
      );
    });

    it('propaga los errores de red', async () => {
      server.use(http.get(PRODUCTS, () => HttpResponse.error()));

      await expect(productService.getProducts()).rejects.toThrow();
    });
  });

  describe('getProductById', () => {
    it('devuelve un producto', async () => {
      server.use(
        http.get(`${PRODUCTS}/:id`, () => HttpResponse.json(product)),
      );

      await expect(productService.getProductById('prod-1')).resolves.toMatchObject({
        id: 'prod-1',
        sku: 'TEC-001',
      });
    });

    it('falla cuando el producto no existe', async () => {
      server.use(
        http.get(`${PRODUCTS}/:id`, () =>
          HttpResponse.json({ message: 'Producto no encontrado' }, { status: 404 }),
        ),
      );

      await expect(productService.getProductById('desconocido')).rejects.toThrow(
        'Producto no encontrado',
      );
    });
  });

  describe('createProduct', () => {
    it('envía los campos como formulario', async () => {
      const received: { name?: unknown; price?: unknown } = {};

      server.use(
        http.post(PRODUCTS, async ({ request }) => {
          const form = await request.formData();
          received.name = form.get('name');
          received.price = form.get('base_price');
          return HttpResponse.json(product, { status: 201 });
        }),
      );

      const created = await productService.createProduct({
        name: 'Teclado mecánico',
        base_price: 250,
      } as never);

      expect(received.name).toBe('Teclado mecánico');
      expect(received.price).toBe('250');
      expect(created.id).toBe('prod-1');
    });

    it('propaga los errores de validación', async () => {
      server.use(
        http.post(PRODUCTS, () =>
          HttpResponse.json(
            { message: ['El nombre es obligatorio', 'El SKU ya existe'] },
            { status: 400 },
          ),
        ),
      );

      // Los mensajes en lista se unen en un solo error
      await expect(
        productService.createProduct({ name: '' } as never),
      ).rejects.toThrow('El nombre es obligatorio\nEl SKU ya existe');
    });
  });

  describe('updateProduct', () => {
    it('actualiza contra el identificador indicado', async () => {
      const seen: { url?: string } = {};

      server.use(
        http.put(`${PRODUCTS}/:id`, ({ request }) => {
          seen.url = request.url;
          return HttpResponse.json({ ...product, name: 'Teclado actualizado' });
        }),
      );

      const updated = await productService.updateProduct('prod-1', {
        name: 'Teclado actualizado',
      } as never);

      expect(seen.url).toContain('/api/products/prod-1');
      expect(updated.name).toBe('Teclado actualizado');
    });

    it('falla cuando el producto no existe', async () => {
      server.use(
        http.put(`${PRODUCTS}/:id`, () =>
          HttpResponse.json({ message: 'Producto no encontrado' }, { status: 404 }),
        ),
      );

      await expect(
        productService.updateProduct('desconocido', { name: 'x' } as never),
      ).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('deleteProduct', () => {
    it('elimina y no devuelve contenido', async () => {
      server.use(
        http.delete(`${PRODUCTS}/:id`, () => new HttpResponse(null, { status: 204 })),
      );

      await expect(productService.deleteProduct('prod-1')).resolves.toBeUndefined();
    });

    it('falla cuando el producto no existe', async () => {
      server.use(
        http.delete(`${PRODUCTS}/:id`, () =>
          HttpResponse.json({ message: 'Producto no encontrado' }, { status: 404 }),
        ),
      );

      await expect(productService.deleteProduct('desconocido')).rejects.toThrow(
        'Producto no encontrado',
      );
    });
  });

  describe('deleteProducts', () => {
    it('envía los identificadores al borrado masivo', async () => {
      const received: { ids?: string[] } = {};

      server.use(
        http.post(`${PRODUCTS}/bulk-delete`, async ({ request }) => {
          received.ids = ((await request.json()) as { ids: string[] }).ids;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await productService.deleteProducts(['prod-1', 'prod-2']);

      expect(received.ids).toEqual(['prod-1', 'prod-2']);
    });
  });

  describe('searchFromPack', () => {
    it('no consulta a la API con un término vacío', async () => {
      let called = false;
      server.use(
        http.get(`${PRODUCTS}/search-from-pack`, () => {
          called = true;
          return HttpResponse.json([]);
        }),
      );

      await expect(productService.searchFromPack('   ')).resolves.toEqual([]);
      expect(called).toBe(false);
    });

    it('devuelve las sugerencias del pack', async () => {
      server.use(
        http.get(`${PRODUCTS}/search-from-pack`, () =>
          HttpResponse.json([{ key: '01010101', description: 'No existe en el catálogo' }]),
        ),
      );

      const result = await productService.searchFromPack('teclado');

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('01010101');
    });
  });

  describe('importFromPack', () => {
    it('exige conexión a internet', async () => {
      const online = Object.getOwnPropertyDescriptor(navigator, 'onLine');
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      try {
        await expect(productService.importFromPack()).rejects.toThrow(
          'Import from pack requires internet connection',
        );
      } finally {
        if (online) Object.defineProperty(navigator, 'onLine', online);
      }
    });
  });

  describe('manejo de errores', () => {
    it('traduce un 403 al mensaje de la API', async () => {
      server.use(
        http.get(PRODUCTS, () =>
          HttpResponse.json({ message: 'No autorizado' }, { status: 403 }),
        ),
      );

      await expect(productService.getProducts()).rejects.toThrow('No autorizado');
    });

    it('usa un mensaje genérico cuando el error no trae cuerpo', async () => {
      server.use(http.get(PRODUCTS, () => new HttpResponse(null, { status: 500 })));

      await expect(productService.getProducts()).rejects.toThrow('Error en la petición');
    });
  });
});
