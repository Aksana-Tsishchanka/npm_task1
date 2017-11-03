import http from 'http';
import fs from 'fs';

const hostname = '127.0.0.1';
const port = 3000;
const filePath = 'data/index.html';

/*
const htmlServer = (req, res) => {
  const file = fs.readFileSync(filePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  
  res.write(file);
  res.end();
};
*/

const htmlStreamServer = (req, res) => {
  const stream = fs.createReadStream(filePath , 'utf8');
  
  stream.on('error', function() {
    res.writeHead(404, 'Not Found');
    res.end('404: File Not Found!');
  });
  
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  stream.pipe(res);
};

const server = http.createServer(htmlStreamServer);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});