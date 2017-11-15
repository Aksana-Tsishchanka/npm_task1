import Express from 'express';
import { User, Product } from './models';
import { cookieParser, queryParser } from './middlewares';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

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
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(cookieParser)
  .use(queryParser);

app.use('/', router);

router
  .use('/api', (req, res, next) => {
    try {
      jwt.verify(req.headers['x-access-token'], 'secret');
      next();
    } catch(e) {
      res.status(403).json({ error: 'Access denied.' });
    }
  });

router.get('/', (request, response) => {
  const { parsedCookies, parsedQuery } = request;
  response.send(`Parsed cookies: ${JSON.stringify(parsedCookies)}\n
    Parsed query: ${JSON.stringify(parsedQuery)}
  `);
});

function generateJWT(login = 'test', pass = '123') {
  return jwt.sign({
    login,
    pass
  }, 'secret', {
    expiresIn: 24 * 60 * 60
  });
}

app.post('/auth', (req, res, next) => {
  console.log(LocalStrategy);
  const { login, pass } = req.body;
  if (login === 'admin' && pass === "admin") {
    const token = generateJWT(login, pass);
    
    const authResponse = {
      code: 200,
      message: "OK",
      data: {
        user: {
          email: "...",
          username: login
        }
      },
      token
    };
    res.json(authResponse);
  } else {
    res.status(404).send({
      code: 404,
      message: "Not Found",
    });
  }
  next();
});

passport.use(new LocalStrategy(
  {
    usernameField: 'login',
    passwordField: 'pass',
    session: false
  },
  function (user, pass, done) {
    if (user === 'admin' && pass === 'admin') {
      return done(null, { login: 'admin' });
    } else return done(null, false);
  }));

app.use(passport.initialize());

app.post('/authenticate', passport.authenticate('local', { session: false, failureRedirect: '/login', successRedirect: '/product' }));

app.get('/product', (req, res) => {
  res.json('PRODUCT PAGE!');
});

app.get('/login', (req, res) => {
  res.json('Please login before proceed');
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