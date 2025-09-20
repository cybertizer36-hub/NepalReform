const serverless = require('serverless-http');
const next = require('next');

// Initialize Next.js app outside handler for reuse
const app = next({
  dev: false,
  conf: {
    compress: false, // Lambda handles compression
    experimental: {
      serverComponentsExternalPackages: []
    }
  }
});

const handle = app.getRequestHandler();

// Prepare the app once
const preparePromise = app.prepare();

// Use serverless-http for better Lambda integration
const serverlessHandler = serverless(async (req, res) => {
  await preparePromise;
  return handle(req, res);
}, {
  binary: ['image/*', 'font/*'],
  request: (request) => {
    // Fix base path if needed
    if (request.url && !request.url.startsWith('/')) {
      request.url = `/${request.url}`;
    }
    return request;
  }
});

exports.handler = async (event, context) => {
  // Keep the function warm
  context.callbackWaitsForEmptyEventLoop = false;
  
  return serverlessHandler(event, context);
};
