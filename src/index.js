import config from './config/app';
import { User, Product }  from './models/index';
import { default as Importer } from './importer/index';
import { default as DirWatcher } from './dirwatcher/index';



console.log(config.name);
new User();
new Product();

const broadcaster = new DirWatcher();
broadcaster.watch('./data', 1000);

broadcaster.on('dirwatcher:changed',
    filePath => Importer.import(filePath)
      .then(data => {
        console.log('import async: ');
        console.log(data);
      }));

broadcaster.on('dirwatcher:changed',
  filePath => {
    console.log('import sync: ');
    console.log(Importer.importSync(filePath));
  }
);
