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
  async filePath => {
    const data = await Importer.import(filePath);
    console.log('Async import: ');
    console.log(data);
  }
);

broadcaster.on('dirwatcher:changed',
  filePath => {
    console.log('Sync import: ');
    console.log(Importer.importSync(filePath));
  }
);
