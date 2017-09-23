import config from './config/app';
import { User, Product }  from './models';
import { default as Importer } from './importer';
import { default as DirWatcher } from './dirwatcher';

console.log(config.name);
new User();
new Product();

const broadcaster = new DirWatcher();
broadcaster.watch('./data', 1000);

let importer = new Importer(broadcaster);

importer.import()
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  });
