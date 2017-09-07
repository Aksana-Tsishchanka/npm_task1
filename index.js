import { default as config }  from './config/app';

import * as Module from './models';
const { User, Product } = Module;

console.log(config.name);

new User();
new Product();
