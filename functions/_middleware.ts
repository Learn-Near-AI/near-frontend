export async function onRequest(context: {
  request: Request;
  next: (input?: Request | { request: Request }) => Promise<Response>;
  env: any;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // If the request is for a static asset (has an extension), serve it normally
  // Check for common static file extensions
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|wasm)$/i)) {
    return context.next();
  }
  
  // If the path is exactly "/" or "/index.html", serve normally
  if (pathname === '/' || pathname === '/index.html') {
    return context.next();
  }
  
  // For all other routes (SPA routes), rewrite to index.html
  const rewrittenUrl = new URL('/index.html', url.origin);
  const rewrittenRequest = new Request(rewrittenUrl.toString(), {
    method: context.request.method,
    headers: context.request.headers,
  });
  
  return context.next({ request: rewrittenRequest });
}

