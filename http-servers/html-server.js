/* npm-run babel-node ./http-servers/html-server.js */
import http from 'http';
import fs from 'fs';

const hostname = '127.0.0.1';
const port = 3000;
const filePath = './http-servers/serve/index.html';


const htmlServer = (req, res) => {
  const content = fs.readFileSync(filePath, "utf8");
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(content.toString().replace('{message}', 'Hi!'));
  res.end();
};

// const htmlStreamServer = (req, res) => {
//   const stream = fs.createReadStream(filePath , 'utf8');
//
//   stream.on('error', function() {
//     res.writeHead(404, 'Not Found');
//     res.end('404: File Not Found!');
//   });
//
//   res.writeHead(200, {
//     'Content-Type': 'text/html'
//   });
//   stream.pipe(res);
// };

const server = http.createServer(htmlServer);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
