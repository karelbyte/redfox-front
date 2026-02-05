import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      access_token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['admin'],
      },
    });
  }),

  http.get('/api/auth/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['admin'],
    });
  }),

  // Products endpoints
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');

    let products = [
      {
        id: 1,
        name: 'Test Product 1',
        description: 'Test product description',
        price: 100.00,
        cost: 50.00,
        stock: 10,
        minStock: 5,
        barcode: '1234567890',
        isActive: true,
        category: { id: 1, name: 'Test Category' },
        brand: { id: 1, name: 'Test Brand' },
      },
      {
        id: 2,
        name: 'Test Product 2',
        description: 'Another test product',
        price: 150.00,
        cost: 75.00,
        stock: 5,
        minStock: 3,
        barcode: '0987654321',
        isActive: true,
        category: { id: 1, name: 'Test Category' },
        brand: { id: 1, name: 'Test Brand' },
      },
    ];

    // Filter by search if provided
    if (search) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode.includes(search)
      );
    }

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }),

  http.get('/api/products/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    
    if (id === 1) {
      return HttpResponse.json({
        id: 1,
        name: 'Test Product 1',
        description: 'Test product description',
        price: 100.00,
        cost: 50.00,
        stock: 10,
        minStock: 5,
        barcode: '1234567890',
        isActive: true,
        category: { id: 1, name: 'Test Category' },
        brand: { id: 1, name: 'Test Brand' },
      });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/products', async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      id: 3,
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Clients endpoints
  http.get('/api/clients', () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'Test Client 1',
          email: 'client1@example.com',
          phone: '1234567890',
          address: 'Test Address 1',
          isActive: true,
        },
        {
          id: 2,
          name: 'Test Client 2',
          email: 'client2@example.com',
          phone: '0987654321',
          address: 'Test Address 2',
          isActive: true,
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  }),

  // Categories endpoints
  http.get('/api/categories', () => {
    return HttpResponse.json([
      { id: 1, name: 'Electronics', description: 'Electronic products' },
      { id: 2, name: 'Clothing', description: 'Clothing items' },
    ]);
  }),

  // Brands endpoints
  http.get('/api/brands', () => {
    return HttpResponse.json([
      { id: 1, name: 'Apple', description: 'Apple products' },
      { id: 2, name: 'Samsung', description: 'Samsung products' },
    ]);
  }),

  // Analytics endpoints
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      totalSales: 15000.00,
      totalOrders: 150,
      totalProducts: 45,
      totalClients: 25,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      productsGrowth: 5.2,
      clientsGrowth: 15.7,
      recentSales: [
        { date: '2024-01-01', amount: 1200.00 },
        { date: '2024-01-02', amount: 1500.00 },
        { date: '2024-01-03', amount: 980.00 },
      ],
      topProducts: [
        { name: 'Product 1', sales: 25 },
        { name: 'Product 2', sales: 18 },
        { name: 'Product 3', sales: 12 },
      ],
    });
  }),
];

export const server = setupServer(...handlers);