import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    // 0. Detect and correct multiple locale segments (double locales like /landlord/en/es/...)
    const segmentLocales = segments.filter(segment => locales.includes(segment as any));
    if (segmentLocales.length > 1) {
        // Keep only the first locale and reconstruct the path
        const firstLocaleIndex = segments.findIndex(segment => locales.includes(segment as any));
        const newSegments = [...segments];
        // Remove all other locale occurrences
        for (let i = segments.length - 1; i > firstLocaleIndex; i--) {
            if (locales.includes(segments[i] as any)) {
                newSegments.splice(i, 1);
            }
        }
        return NextResponse.redirect(new URL(`/${newSegments.join('/')}`, request.url));
    }

    const cookieTenant = request.cookies.get('last_tenant')?.value;
    const authPaths = ['login', 'register', 'forgot-password', 'reset-password', 'activate', 'theme-demo'];

    // 2. Handle root path
    if (pathname === '/') {
        // If we have a tenant cookie, go to the tenant dashboard
        if (cookieTenant) {
            return NextResponse.redirect(new URL(`/${cookieTenant}/${defaultLocale}`, request.url));
        }
        // Otherwise go to global login
        return NextResponse.redirect(new URL(`/${defaultLocale}/login`, request.url));
    }

    // 3. Handle structure starting with locale: /[locale]/...
    if (locales.includes(segments[0] as any)) {
        const locale = segments[0];
        const nextSegment = segments[1];

        // If it's a global auth path, allow it
        if (authPaths.includes(nextSegment)) {
            return NextResponse.next();
        }

        // Otherwise, it's missing a tenant. 
        // If we have a cookie, use it. Otherwise, go to login.
        if (!cookieTenant) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        }

        const subpath = segments.slice(1).join('/');
        return NextResponse.redirect(new URL(`/${cookieTenant}/${locale}${subpath ? `/${subpath}` : ''}`, request.url));
    }

    // 4. Handle path starting with something that's not a locale
    // It could be a tenant slug /[tenant]/... or a global path without locale /login
    const firstSegment = segments[0];
    const secondSegment = segments[1];

    // If it's a global auth path without locale: /login -> /es/login
    if (authPaths.includes(firstSegment)) {
        const subpath = segments.slice(1).join('/');
        return NextResponse.redirect(new URL(`/${defaultLocale}/${firstSegment}${subpath ? `/${subpath}` : ''}`, request.url));
    }

    // If it's a path starting with tenant but missing locale: /landlord/dashboard -> /landlord/es/dashboard
    if (segments.length > 0 && !locales.includes(secondSegment as any)) {
        const targetLocale = defaultLocale;
        const subpath = segments.slice(1).join('/');
        return NextResponse.redirect(new URL(`/${firstSegment}/${targetLocale}${subpath ? `/${subpath}` : ''}`, request.url));
    }

    // 5. Valid /[tenant]/[locale] structure
    const response = NextResponse.next();

    // Update cookie if it changed. 
    // If first segment is a tenant (not a locale) and it's different from current cookie
    if (firstSegment && !locales.includes(firstSegment as any) && firstSegment !== cookieTenant) {
        response.cookies.set('last_tenant', firstSegment, { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
