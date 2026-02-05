import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateProductStock } from '../products.service';
import { server } from '../../__mocks__/server';
import { http, HttpResponse } from 'msw';

// Mock the API base URL
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';

describe('ProductsService', () => {
  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const result = await getProducts(1, 10);

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'Test Product 1',
            price: 100.00,
          }),
        ]),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should fetch products with search parameter', async () => {
      const result = await getProducts(1, 10, 'Test Product 1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Product 1');
    });

    it('should handle empty search results', async () => {
      const result = await getProducts(1, 10, 'NonExistentProduct');

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API errors', async () => {
      // Override the handler to return an error
      server.use(
        http.get('/api/products', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(getProducts(1, 10)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      // Override the handler to simulate network error
      server.use(
        http.get('/api/products', () => {
          return HttpResponse.error();
        })
      );

      await expect(getProducts(1, 10)).rejects.toThrow();
    });
  });

  describe('getProduct', () => {
    it('should fetch a single product successfully', async () => {
      const result = await getProduct(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test Product 1',
          price: 100.00,
          stock: 10,
        })
      );
    });

    it('should handle product not found', async () => {
      await expect(getProduct(999)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('/api/products/:id', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(getProduct(1)).rejects.toThrow();
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const newProduct = {
        name: 'New Test Product',
        description: 'New product description',
        price: 200.00,
        cost: 100.00,
        stock: 15,
        minStock: 5,
        barcode: '1111111111',
        categoryId: 1,
        brandId: 1,
      };

      const result = await createProduct(newProduct);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: newProduct.name,
          price: newProduct.price,
          isActive: true,
        })
      );
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('/api/products', () => {
          return HttpResponse.json(
            { message: ['name should not be empty'] },
            { status: 400 }
          );
        })
      );

      const invalidProduct = {
        name: '',
        price: -10,
      };

      await expect(createProduct(invalidProduct as any)).rejects.toThrow();
    });

    it('should handle duplicate barcode error', async () => {
      server.use(
        http.post('/api/products', () => {
          return HttpResponse.json(
            { message: 'Barcode already exists' },
            { status: 400 }
          );
        })
      );

      const duplicateProduct = {
        name: 'Duplicate Product',
        barcode: '1234567890', // Existing barcode
        price: 100.00,
      };

      await expect(createProduct(duplicateProduct as any)).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 250.00,
      };

      server.use(
        http.put('/api/products/:id', async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: 1,
            name: body.name,
            price: body.price,
            description: 'Test product description',
            cost: 50.00,
            stock: 10,
            minStock: 5,
            barcode: '1234567890',
            isActive: true,
          });
        })
      );

      const result = await updateProduct(1, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
    });

    it('should handle product not found', async () => {
      server.use(
        http.put('/api/products/:id', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(updateProduct(999, { name: 'Updated' })).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      server.use(
        http.put('/api/products/:id', () => {
          return HttpResponse.json(
            { message: ['price must be a positive number'] },
            { status: 400 }
          );
        })
      );

      await expect(updateProduct(1, { price: -10 })).rejects.toThrow();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      server.use(
        http.delete('/api/products/:id', () => {
          return HttpResponse.json({
            id: 1,
            name: 'Test Product 1',
            isActive: false,
          });
        })
      );

      const result = await deleteProduct(1);

      expect(result.isActive).toBe(false);
    });

    it('should handle product not found', async () => {
      server.use(
        http.delete('/api/products/:id', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(deleteProduct(999)).rejects.toThrow();
    });
  });

  describe('updateProductStock', () => {
    it('should update product stock successfully', async () => {
      server.use(
        http.patch('/api/products/:id/stock', async ({ request }) => {
          const body = await request.json();
          const newStock = body.operation === 'add' ? 15 : 5; // 10 + 5 or 10 - 5
          
          return HttpResponse.json({
            id: 1,
            name: 'Test Product 1',
            stock: newStock,
            price: 100.00,
            cost: 50.00,
            minStock: 5,
            barcode: '1234567890',
            isActive: true,
          });
        })
      );

      const result = await updateProductStock(1, 5, 'add');

      expect(result.stock).toBe(15);
    });

    it('should handle insufficient stock error', async () => {
      server.use(
        http.patch('/api/products/:id/stock', () => {
          return HttpResponse.json(
            { message: 'Insufficient stock' },
            { status: 400 }
          );
        })
      );

      await expect(updateProductStock(1, 20, 'subtract')).rejects.toThrow();
    });

    it('should handle invalid operation', async () => {
      server.use(
        http.patch('/api/products/:id/stock', () => {
          return HttpResponse.json(
            { message: 'Invalid operation' },
            { status: 400 }
          );
        })
      );

      await expect(updateProductStock(1, 5, 'invalid' as any)).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle unauthorized requests', async () => {
      server.use(
        http.get('/api/products', () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      await expect(getProducts(1, 10)).rejects.toThrow();
    });

    it('should handle forbidden requests', async () => {
      server.use(
        http.post('/api/products', () => {
          return new HttpResponse(null, { status: 403 });
        })
      );

      await expect(createProduct({} as any)).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('/api/products', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(getProducts(1, 10)).rejects.toThrow();
    });
  });
});