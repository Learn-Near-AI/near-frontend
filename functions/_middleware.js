export function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // List of static file extensions that should be served directly
  const staticExtensions = ['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.webp', '.mp4', '.webm', '.wasm'];
  
  // Check if the path is a static file (has an extension)
  const hasExtension = staticExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
  
  // Don't rewrite if:
  // 1. It's a static file (has extension)
  // 2. It's already index.html
  // 3. It's the root path
  // 4. It's in the /assets/ directory (static assets)
  if (hasExtension || 
      pathname === '/index.html' || 
      pathname === '/' ||
      pathname.startsWith('/assets/')) {
    return context.next();
  }
  
  // Rewrite all other routes to index.html for SPA routing
  return context.rewrite(new URL('/index.html', context.request.url));
}

