export function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Don't redirect if it's a file request (has extension) or is index.html
  if (url.pathname.includes('.') && !url.pathname.endsWith('/')) {
    return context.next();
  }
  
  // Don't redirect if it's already index.html
  if (url.pathname === '/index.html' || url.pathname === '/') {
    return context.next();
  }
  
  // Redirect all other routes to index.html
  return context.rewrite(new URL('/index.html', context.request.url));
}

