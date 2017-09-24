import config from './config/app';
import { User, Product }  from './models';
import { default as Importer } from './importer';
import { default as DirWatcher } from './dirwatcher';



console.log(config.name);
new User();
new Product();

const broadcaster = new DirWatcher();
broadcaster.watch('./data', 1000);

broadcaster.on('dirwatcher:changed',
    filePath => Importer.import(filePath)
      .then(data => {
        console.log('import: ');
        console.log(data);
      }));

broadcaster.on('dirwatcher:changed',
  filePath => {
    console.log('importSync: ');
    console.log(Importer.importSync(filePath));
  }
);
