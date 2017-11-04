import Express from 'express';
import { User, Product } from './models';
import { cookieParser, queryParser } from './middlewares';

const app = new Express();
const bodyParser = require('body-parser');
const router = Express.Router();

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
  .use(bodyParser.json())
  .use(cookieParser)
  .use(queryParser)
  .use('/', router);

router.get('/', (request, response) => {
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

router.route('/api/products')
  .get((request, response) => {
    response.json(products);
  })
  .post((req, res) => {
    const newProduct = createProduct(req.body);
    res.send(newProduct);
  });

function getProduct(id) {
  const product = getModelById(products, id);
  if (product) {
    return product;
  }
}

router.get('/api/products/:id', (request, response) => {
  const product = getProduct(request.params.id);
  if (product) {
    response.json(product);
  } else response.status(404).json({ error: 'Not found' });
});

router.get('/api/products/:id/reviews', (request, response) => {
  const product = getProduct(request.params.id);
  if (product) {
    response.json(product.getReviews());
  } else response.status(404).json({ error: 'Not found' });
});

router.get('/api/users', (request, response) => {
  response.json(users);
});

export default app;