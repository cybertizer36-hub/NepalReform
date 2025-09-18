const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

let server;

async function createServerlessHandler() {
  if (!server) {
    const app = next({ 
      dev: false,
      customServer: true,
      dir: __dirname,
      conf: {
        env: process.env,
        experimental: {
          serverComponentsExternalPackages: []
        }
      }
    });
    
    await app.prepare();
    
    const handle = app.getRequestHandler();
    
    server = createServer((req, res) => {
      // Parse the request URL
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
  }
  
  return server;
}

exports.handler = async (event, context) => {
  try {
    const server = await createServerlessHandler();
    
    // Convert Lambda event to HTTP request format
    const { httpMethod, path, queryStringParameters, headers, body } = event;
    
    // Build the request URL
    let url = path || '/';
    if (queryStringParameters) {
      const params = new URLSearchParams(queryStringParameters).toString();
      url += params ? `?${params}` : '';
    }
    
    // Create a mock HTTP request
    const req = {
      method: httpMethod || 'GET',
      url: url,
      headers: headers || {},
      body: body || '',
      socket: { remoteAddress: '127.0.0.1' }
    };
    
    // Create a mock HTTP response
    let statusCode = 200;
    let responseHeaders = {};
    let responseBody = '';
    
    const res = {
      statusCode: 200,
      setHeader: (key, value) => {
        responseHeaders[key] = value;
      },
      writeHead: (code, headers) => {
        statusCode = code;
        if (headers) {
          Object.assign(responseHeaders, headers);
        }
      },
      write: (chunk) => {
        responseBody += chunk;
      },
      end: (chunk) => {
        if (chunk) responseBody += chunk;
      }
    };
    
    // Process the request
    await new Promise((resolve, reject) => {
      server.emit('request', req, res);
      res.end = (chunk) => {
        if (chunk) responseBody += chunk;
        resolve();
      };
    });
    
    return {
      statusCode,
      headers: responseHeaders,
      body: responseBody,
      isBase64Encoded: false
    };
    
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
