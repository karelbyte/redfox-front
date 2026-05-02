import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function subscriptionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/login',
    '/register',
    '/activate',
    '/forgot-password',
    '/reset-password',
    '/pricing',
  ];

  const subscriptionRoutes = [
    '/dashboard/suscripcion',
    '/dashboard/suscripcion/pago',
  ];

  if (publicRoutes.some(route => pathname.includes(route))) {
    return NextResponse.next();
  }

  if (subscriptionRoutes.some(route => pathname.includes(route))) {
    return NextResponse.next();
  }

  if (pathname.includes('/dashboard')) {
    try {
      const token = request.cookies.get('token')?.value;

      if (!token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010';
      const response = await fetch(`${apiUrl}/subscriptions/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.isActive) {
          const paymentUrl = new URL(pathname.replace('/dashboard', '/dashboard/suscripcion/pago'), request.url);
          return NextResponse.redirect(paymentUrl);
        }
      }
    } catch (error) {
    }
  }

  return NextResponse.next();
}
