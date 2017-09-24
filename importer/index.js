import csvjson from 'csvjson';
import fs from 'fs';

class Importer {
  
  static async import(filePath) {
    return await csvJsoAsync(filePath);
  }
  
  static importSync(filePath) {
    return csvJsonSync(filePath);
  }
}

function csvJsoAsync(path) {
  return new Promise((resolve, reject) => {
    let options = {
      delimiter : ',',
      quote     : '"'
    };
    
    fs.readFile(path, { encoding : 'utf8' }, (error, data) => {
      if (error) reject(error)
      else resolve(csvjson.toObject(data, options));
    });
  });
}

function csvJsonSync(path) {
  let options = {
    delimiter : ',',
    quote     : '"'
  };
  
  let data = fs.readFileSync(path, { encoding : 'utf8' });
  return csvjson.toObject(data, options);
}

export default Importer;