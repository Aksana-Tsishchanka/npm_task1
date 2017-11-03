/* babel-node ./http-servers/json-server.js */
import http from 'http';

const hostname = '127.0.0.1';
const port = 3000;

const product = { id: 1,
  name: 'Supreme T-Shirt',
  brand: 'Supreme',
  price: 99.99,
  options: [
    { color: 'blue' },
    { size: 'XL' }
  ]
};

const server = http.createServer((req,res) => {
  req.on('error', (err) => {
    console.error(err.stack);
  });
  
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(product));
  res.end();
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
