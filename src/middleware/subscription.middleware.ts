import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function subscriptionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que no requieren verificación de suscripción
  const publicRoutes = [
    '/login',
    '/register',
    '/activate',
    '/forgot-password',
    '/reset-password',
    '/pricing',
  ];

  // Rutas de suscripción que siempre deben ser accesibles
  const subscriptionRoutes = [
    '/dashboard/suscripcion',
    '/dashboard/suscripcion/pago',
  ];

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some(route => pathname.includes(route))) {
    return NextResponse.next();
  }

  // Si es una ruta de suscripción, permitir acceso
  if (subscriptionRoutes.some(route => pathname.includes(route))) {
    return NextResponse.next();
  }

  // Si es una ruta del dashboard, verificar suscripción
  if (pathname.includes('/dashboard')) {
    try {
      // Obtener el token de autenticación
      const token = request.cookies.get('token')?.value;

      if (!token) {
        // Si no hay token, redirigir a login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Verificar estado de suscripción
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010';
      const response = await fetch(`${apiUrl}/subscriptions/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Si la suscripción no está activa, redirigir a página de pago
        if (!data.isActive) {
          const paymentUrl = new URL(pathname.replace('/dashboard', '/dashboard/suscripcion/pago'), request.url);
          return NextResponse.redirect(paymentUrl);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // En caso de error, permitir acceso (fail-safe)
    }
  }

  return NextResponse.next();
}
