// Cloudflare Worker for SPA routing
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // If the request is for a static asset (has an extension), serve it normally
    if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|wasm|html)$/i)) {
      // Let Cloudflare serve the asset
      return env.ASSETS.fetch(request);
    }

    // For all other routes (SPA routes), serve index.html
    const indexRequest = new Request(new URL('/index.html', request.url), request);
    return env.ASSETS.fetch(indexRequest);
  }
};

