import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('x-better-seo-public-locale');
  const locale = request.nextUrl.pathname.match(/^\/(en|fr)\/resources(?:\/|$)/)?.[1];
  if (locale) headers.set('x-better-seo-public-locale', locale);
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|opengraph-image).*)'] };
