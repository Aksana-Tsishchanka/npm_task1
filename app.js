import Express from 'express';
import session from 'express-session';
import { User, Product } from './models1';
import { cookieParser, queryParser } from './middlewares';
import { jwtAuth, verifyJwt } from './controllers/jwtAuthentication';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import DB from './database';

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
/* generate data end*/
try {
  DB.init();
} catch(e) {
  console.error('\n Unable to connect to the database:');
}

console.log('Connection has been established successfully.');
DB.createUserTable();
DB.createProductTable(products);

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
//router.use('/api', verifyJwt);
/* end jsonwebtoken for authentication */

router.route('/api/products')
  .get(async (request, response) => {
    let products;
    try {
      products = await DB.getProducts();
    }
    catch(e) {
      response.json({ error: e });
    }
    response.json(products);
  })
  .post(async (req, res) => {
    const { name } = req.body;
    const product = {
      name
    };
    let newProduct;
    try {
      newProduct = await DB.createProduct(product);
    }
    catch(e) {
      res.send({ error: "product can't be created" });
    }
    res.send(newProduct);
  });

router.get('/api/products/:id', async (request, response) => {
  let product;
  try {
    product = await DB.getProductById(request.params.id);
  }
  catch(e) {
    response.status(404).json({ error: 'Not found' });
  }
  if (!product) {
    response.status(404).json({ error: 'Not found' });
  } else response.json(product);
});

router.get('/api/users', async (request, response) => {
  let user;
  try {
    user = await DB.getUsers();
  }
  catch(e) {
    response.json({ error: e });
  }
  response.json(user);
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