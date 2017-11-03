import Express from 'express';
import { User, Product } from './models/index';

const app = new Express();
const bodyParser = require('body-parser');

/* generate data */
let users = [];
let products = [];

for (let i = 0; i < 10; i++) {
  users.push(new User(`User${i}`));
  let product = new Product(`Product${i}`);
  
  for (let i = 0; i < 5; i++) {
    product.addReview(`Review${i}`);
  }
  products.push(product);
}

function getModelById(models, id) {
  return models.filter(model => model.id == id)[0];
}

app
  .use('/api/products', bodyParser.json())
  .use((req, res, next) => {
    if (req.headers.cookie) {
      req.parsedCookies = cookieParser(req.headers.cookie);
    } else req.parsedCookies = {};
    req.pipe(res);
    next();
  })
  .use((req, res, next) => {
    req.parsedQuery = req.query;
    req.pipe(res);
    next();
  });

function cookieParser(cookie) {
  let result = {};
  let arr = cookie.split(';');
  arr.map(el => {
    const cookieStr = el.split('=');
    result[cookieStr[0]] = cookieStr[1];
  });
  return result;
}

app.get('/', (request, response) => {
  const { parsedCookies, parsedQuery } = request;
  response.send(`Parsed cookies: ${JSON.stringify(parsedCookies)}\n
    Parsed query: ${JSON.stringify(parsedQuery)}
  `);
});

function createProduct({ name, reviews = [] }) {
  const product = new Product(name);
  if (reviews instanceof Array && reviews.length > 0) {
    reviews.forEach(review => {
      product.addReview(review);
    });
  }
  products.push(product);
  return product;
}

app.route('/api/products')
  .get((request, response) => {
    response.send(products);
  })
  .post((req, res) => {
    let newProduct = createProduct(req.body);
    res.send(newProduct);
  });

function getProduct(id) {
  const product = getModelById(products, id);
  if (product) {
    return product;
  }
}

app.get('/api/products/:id', (request, response) => {
  const product = getProduct(request.params.id);
  if (product) {
    response.send(product);
  } else response.send({ error: 'Not found' });
});

app.get('/api/products/:id/reviews', (request, response) => {
  const product = getProduct(request.params.id);
  if (product) {
    response.send(product.getReviews());
  } else response.send({ error: 'Not found' });
});

app.get('/api/users', (request, response) => {
  response.send(users);
});

export default app;