import EventEmitter from 'events';
import Chokidar from 'chokidar';

class DirWatcher extends EventEmitter {
  
  watch(path, delay) {
    let options = {
      usePolling: !!delay,
      interval: delay,
      ignored: /(\.json|\.css|\.txt)/
    };
    Chokidar.watch(path, options)
      .on('add', path => {
        this.emit('dirwatcher:changed', path);
        console.log(`File ${path} has been added`);
      });
  }
}

export default DirWatcher;

  
