import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export default function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Skip internal/static files
    if (
        pathname.includes('.') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/_vercel')
    ) {
        return NextResponse.next();
    }

    const segments = pathname.split('/').filter(Boolean);
    const authPaths = ['login', 'register', 'forgot-password', 'reset-password', 'activate', 'theme-demo'];

    // Helper to create redirect URL with preserved search params
    const createRedirect = (newPath: string) => {
        const url = new URL(newPath + search, request.url);
        console.log(`[Middleware] Redirecting to: ${url.pathname}${url.search}`);
        return NextResponse.redirect(url);
    };

    // 0. Detect and correct multiple locale segments
    const segmentLocales = segments.filter(segment => locales.includes(segment as any));
    if (segmentLocales.length > 1) {
        const firstLocaleIndex = segments.findIndex(segment => locales.includes(segment as any));
        const newSegments = [...segments];
        for (let i = segments.length - 1; i > firstLocaleIndex; i--) {
            if (locales.includes(segments[i] as any)) {
                newSegments.splice(i, 1);
            }
        }
        console.log(`[Middleware] Section 0: Multiple locales detected. Cleaning...`);
        return createRedirect(`/${newSegments.join('/')}`);
    }

    const cookieTenant = request.cookies.get('last_tenant')?.value;

    // 2. Handle root path
    if (pathname === '/') {
        console.log(`[Middleware] Section 2: Root path.`);
        if (cookieTenant) {
            return createRedirect(`/${cookieTenant}/${defaultLocale}`);
        }
        return createRedirect(`/${defaultLocale}/login`);
    }

    // 3. Handle structure starting with locale: /[locale]/...
    if (locales.includes(segments[0] as any)) {
        const locale = segments[0];
        const nextSegment = segments[1];

        // If it's a global auth path, allow it
        if (authPaths.includes(nextSegment)) {
            // console.log(`[Middleware] Section 3: Global auth path allowed: ${pathname}`);
            return NextResponse.next();
        }

        // Missing tenant but has locale
        if (!cookieTenant) {
            console.log(`[Middleware] Section 3: Missing tenant/cookie. Redirecting to login.`);
            return createRedirect(`/${locale}/login`);
        }

        const subpath = segments.slice(1).join('/');
        console.log(`[Middleware] Section 3: Applying tenant from cookie: ${cookieTenant}`);
        return createRedirect(`/${cookieTenant}/${locale}${subpath ? `/${subpath}` : ''}`);
    }

    // 4. Handle path starting with something that's not a locale
    const firstSegment = segments[0];
    const secondSegment = segments[1];

    // Global auth path without locale: /login -> /es/login
    if (authPaths.includes(firstSegment)) {
        const subpath = segments.slice(1).join('/');
        console.log(`[Middleware] Section 4: Global auth path without locale.`);
        return createRedirect(`/${defaultLocale}/${firstSegment}${subpath ? `/${subpath}` : ''}`);
    }

    // Path starting with tenant but missing locale: /landlord/dashboard -> /landlord/es/dashboard
    // REGLA CRITICA: Si el segundo segmento es un authPath, NO añadir locale redundante
    if (segments.length > 0 && !locales.includes(secondSegment as any)) {
        if (authPaths.includes(secondSegment)) {
            // Ya tiene estructura /[tenant]/[authPath], es válida
            return NextResponse.next();
        }

        console.log(`[Middleware] Section 4: Tenant path missing locale.`);
        const targetLocale = defaultLocale;
        const subpath = segments.slice(1).join('/');
        return createRedirect(`/${firstSegment}/${targetLocale}${subpath ? `/${subpath}` : ''}`);
    }

    // 5. Valid structure
    const response = NextResponse.next();

    // Update cookie if it changed
    if (firstSegment && !locales.includes(firstSegment as any) && firstSegment !== cookieTenant) {
        response.cookies.set('last_tenant', firstSegment, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
