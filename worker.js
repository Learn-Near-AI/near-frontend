// Cloudflare Worker for SPA routing
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Get the ASSETS binding - it should be available when using assets in wrangler.jsonc
      const assets = env.ASSETS || env.__STATIC_CONTENT;
      
      if (!assets) {
        // If no assets binding, return error
        return new Response('Assets binding not available', { status: 500 });
      }

      // If the request is for a static asset (has an extension), serve it normally
      if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|wasm)$/i)) {
        // Let Cloudflare serve the asset
        return assets.fetch(request);
      }

      // For all other routes (SPA routes), serve index.html
      const indexUrl = new URL('/index.html', request.url);
      const indexRequest = new Request(indexUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });
      
      return assets.fetch(indexRequest);
    } catch (error) {
      // Return a proper error response with details
      console.error('Worker error:', error);
      return new Response(`Worker error: ${error.message}\nStack: ${error.stack}`, {
        status: 500,
        headers: { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  }
};

