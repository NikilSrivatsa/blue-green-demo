const http = require('http');

const port = process.env.PORT || 8080;
const version = process.env.APP_VERSION || 'local';
const color = process.env.APP_COLOR || 'unknown';

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      version,
      color
    });
    return;
  }

  if (req.url === '/') {
    sendJson(res, 200, {
      service: 'blue-green-demo',
      version,
      color,
      message: `Hello from the ${color} environment`
    });
    return;
  }

  sendJson(res, 404, {
    error: 'not_found'
  });
});

server.listen(port, () => {
  console.log(`blue-green-demo listening on ${port}`);
});
