const http = require('http');
const url = require('url');

const httpServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  const handler =
    typeof router[path] === 'undefined' ? handlers.notFound : router[path];

  handler((statusCode, payload) => {
    statusCode = typeof statusCode === 'number' ? statusCode : 200;
    payload = typeof payload === 'object' ? payload : {};

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(statusCode);
    res.end(JSON.stringify(payload));
  });
});

httpServer.listen(3000, () =>
  console.log(`The server is listening on port 3000`)
);

const handlers = {
  hello: callback => callback(200, { value: 'Hello world' }),
  notFound: callback => callback(404)
};

const router = {
  hello: handlers.hello
};
