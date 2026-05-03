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
  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`
    <html>
    <head>
      <title>Blue-Green Deployment</title>
      <style>
        body {
          font-family: Arial;
          text-align: center;
          margin-top: 100px;
          background-color: ${color === "green" ? "#d4edda" : "#cce5ff"};
        }
        .card {
          padding: 30px;
          border-radius: 10px;
          display: inline-block;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        h1 { color: ${color === "green" ? "green" : "blue"}; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Blue-Green Deployment</h1>
        <h2>Environment: ${color.toUpperCase()}</h2>
        <p>Version: ${version}</p>
        <p>Status: ✅ Running Successfully</p>
      </div>
    </body>
    </html>
  `);

  return;
}

  sendJson(res, 404, {
    error: 'not_found'
  });
});

server.listen(port, () => {
  console.log(`blue-green-demo listening on ${port}`);
});
