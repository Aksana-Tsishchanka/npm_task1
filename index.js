/*eslint-disable*/
const config = require('./config/app');
/*eslint-enable*/

import { default as Module } from './models';
const { User, Product } = Module;

/*eslint-disable*/
console.log(config.name);
/*eslint-enable*/
new User();
new Product();
