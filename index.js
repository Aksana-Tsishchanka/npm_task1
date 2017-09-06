require('babel-register')({
    presets: [ 'es2015', 'stage-2' ]
});

let config = require('./config/app');
const { User, Product } = require('./models/models');

console.log(config.name);
new User();
new Product();
