import Express from 'express';
import session from 'express-session';
import { User, Product } from './models';
import { cookieParser, queryParser } from './middlewares';
import { jwtAuth, verifyJwt } from './controllers/jwtAuthentication';
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
/* generate data end*/

app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(cookieParser)
  .use(queryParser);

app.use('/', router);

router.get('/', (request, response) => {
  const { parsedCookies, parsedQuery } = request;
  response.send(`Parsed cookies: ${JSON.stringify(parsedCookies)}\n
    Parsed query: ${JSON.stringify(parsedQuery)}
  `);
});

/* jsonwebtoken for authentication */
app.post('/auth', jwtAuth);
router.use('/api', verifyJwt);
/* end jsonwebtoken for authentication */

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

/*passport local strategy */
const myUser =  {
  id: 1,
  username: 'admin',
  password: 'admin',
};

passport.use(new LocalStrategy(
  function (user, pass, done) {
    if (user === 'admin' && pass === 'admin') {
      return done(null, myUser);
    } else return done(null, false);
  }));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.post('/authenticate', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/product' }));
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    res.status(403).json('403 - Not logged in!');
  }
  else {
    next();
  }
}

app.get('/product',
  ensureLoggedIn,
  (req, res) => {
    res.json('PRODUCT PAGE! You are logged in');
  });

app.get('/login', (req, res) => {
  res.json('Please login before proceed');
});
/* passport local strategy end */

export default app;