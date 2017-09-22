import EventEmitter from 'events';
import csv from 'csvtojson';

class Importer extends EventEmitter {
  constructor(broadcaster) {
    super();
    this.broadcaster = broadcaster;
  }
  // async test(path) {
  //   return await readCVSAsync(path);
  // }
}

Importer.prototype.import = async function() {
  let data = await broadcastOnAsync.apply(this);
  return readCVSAsync(data);
};


function broadcastOnAsync() {
  let self = this;
  
  return new Promise(resolve => {
    self.broadcaster.on('dirwatcher:changed', filePath => {
      if (filePath) return resolve(filePath);
    });
  });
}

function readCVSAsync(path) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(path)
      .on('json', jsonObj => {
        resolve(jsonObj);
      })
      .on('done', (error = '') => {
        if (error) reject(error);
      });
  });
}

export default Importer;