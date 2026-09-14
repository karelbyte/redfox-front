import { NextResponse } from 'next/server';

/**
 * Comprobación de salud para la plataforma de despliegue.
 *
 * Existe como ruta propia porque el middleware redirige la raíz a la página de
 * login o del tenant, y el healthcheck recibía un 307 en lugar de un 2xx. Las
 * rutas bajo /api quedan fuera del middleware, así que esta responde directa.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { status: 'ok', uptime: process.uptime() },
    { status: 200 },
  );
}

/** Algunos comprobadores usan HEAD en lugar de GET. */
export function HEAD() {
  return new NextResponse(null, { status: 200 });
}
