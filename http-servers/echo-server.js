/* babel-node ./http-servers/echo-server.js
* curl --data "param1=value1&param2=value2" http://127.0.0.1:3000
* */
import http from 'http';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  let reqHeaders = req.headers['content-type'];
  if (reqHeaders) {
    res.setHeader('Content-Type', reqHeaders);
  }
  req.on('error', (err) => {
    console.error(err.stack);
  })
    .pipe(res);
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
