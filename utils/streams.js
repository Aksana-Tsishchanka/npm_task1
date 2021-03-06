import Argv from 'yargs';
import fs from 'fs';
import through from 'through2';
import path from 'path';
import request from 'request';
import multiStream from 'multistream';
import split from 'split';

const BASE_CSS_URL = 'https://www.epam.com/etc/clientlibs/foundation/main.min.fc69c13add6eae57cd247a91c7e26a15.css';

const actions = {
  io: inputOutput,
  transform,
  csvToJsonStream,
  csvToJsonFile,
  cssBundler: simpleCssBundler,
  generateTestCSS,
  generateCSV
};

export default actions;

if (require.main === module) {
  cliRun();
}

function cliRun() {
  const argv = Argv
    .version('1.0.0')
    .usage('Usage: $0 --action actionType [--file filePath]')
    .example('$0 --action=io --file=./src/example.js')
    .example('$0 --action transform --file=./data/test.txt')
    .example('$0 -a csvToJsonStream -f ./data/test.csv')
    .example('$0 -a csvToJsonFile -f ./data/test.csv')
    .example('$0 --action cssBundler --path ./data/css')
    .example('$0 --action generateTestCSS --path ./data/css')
    .example('$0 --action generateCSV --file ./data/test.csv')
    .demandOption(['action'])
    .option('action', {
      alias: 'a',
      describe: 'choose an action',
      choices: ['io', 'transform', 'csvToJsonStream', 'csvToJsonFile', 'cssBundler', 'generateTestCSS', 'generateCSV']
    })
    .option('file', {
      alias: 'f',
      describe: 'provide a path to file (mandatory for -a=csvToJsonFile or -a=io)'
    })
    .option('path', {
      alias: 'p',
      describe: 'provide a path to folder to bundle CSS files (mandatory for --action=cssBundler)'
    })
    .help('h')
    .argv;
  let pathActions = ['cssBundler', 'generateTestCSS'];
  
  if (argv.action) {
    if(pathActions.includes(argv.action)) actions[argv.action](argv.path);
    else actions[argv.action](argv.file);
  }
}

/* stream helpers*/
function inputOutput(filePath) { /* 4, babel-node ./utils/streams.js -a io -f ./data/test.txt */
  if (fs.existsSync(filePath)) fs.createReadStream(filePath).pipe(process.stdout);
  else console.log('Please specify correct file path');
}

function stdInInformUser() {
  process.stdout.write(`Please start typing to transform ...
  to end input use CTRL + D for macOS and Alt-Space. Then, C for Windows\n`);
  process.stdin.setEncoding('utf8');
}

function end() {
  process.stdout.write('Transform was completed\n');
}

function write(buffer, encoding, next) {
  this.push(`Transformed to: ${buffer.toString().toUpperCase()}`);
  next();
}

function transform() { /* 5, node ./utils/streams.js -a transform */
  stdInInformUser();
  process.stdin
    .pipe(through(write, end))
    .pipe(process.stdout);
}

function csvToJson(filePath, output) {
  if (fs.existsSync(filePath) && path.extname(filePath) === '.csv') {
    const readableStream = fs.createReadStream(filePath, 'utf8');
    let header;
    let count = 0;
    readableStream
      .pipe(split(/\n+/, null, { trailing: false }))
      .pipe(through(function(buffer, enc, nextChunk) {
        if (count === 0) {
          header = buffer.toString().split(','); // column1 column2
        }
        else {
          let obj = {};
          let columns = buffer.toString().split(',');
          let columnsAmount = columns.length;
          for (let i = 0; i < columnsAmount; i++) {
            obj[header[i]] = columns[i];
          }
          if (count === 1 ) this.push(JSON.stringify(obj) );
          else this.push(',\n' + JSON.stringify(obj));
        }
        ++count;
        nextChunk();
      }))
      .once('data', function() {
        this.push('[');
      })
      .once('close', function() {
        this.push(']');
      })
      .on('data', function(data) {
        output.write(data);
      })
      .once('finish', function() {
        output.write(']');
        console.log('\nDone!');
      });
  }
  else console.log('\nPlease specify correct file path');
}

function csvToJsonStream(filePath) { /* 6, babel-node ./utils/streams.js -a csvToJsonStream -f ./data/test.csv */
  csvToJson(filePath, process.stdout);
}

function createFilePath(filePath, extension = '.json', name) {
  const pathJsonFile = path.parse(filePath);
  
  pathJsonFile.ext = extension;
  pathJsonFile.base = `${pathJsonFile.name || name}${pathJsonFile.ext}`;
  return path.format(pathJsonFile);
}

function csvToJsonFile(filePath) { /* 7, babel-node ./utils/streams.js -a csvToJsonFile -f ./data/test.csv */
  const writableStream = fs.createWriteStream(createFilePath(filePath));
  csvToJson(filePath, writableStream);
}

/* generate test files */
function writeDataToStream(data, writerableStream, count) {
  if (count === 0) { console.log("csv file was generated!"); return;}
  writerableStream.write(data, function() {
    writeDataToStream(data, writerableStream, --count);
  });
}

function getFolderPath(path) {
  return path[path.length - 1] === "/" ? path : `${path}/`;
}

function createFileName(filePath, extension, prefixName) {
  const pathJsonFile = path.parse(filePath);
  if (extension) {
    pathJsonFile.ext = extension;
  }
  pathJsonFile.base = `${pathJsonFile.name}${prefixName}${pathJsonFile.ext}`;
  return path.format(pathJsonFile);
}

function generateTestCSS(path = './data/css') {
  fs.readdir(path, (err, files) => {
    files.forEach(file => {
      console.log(createFileName(`${getFolderPath(path)}${file}`, null, '_large'));
      const writerableStream = fs.createWriteStream(createFileName(`${getFolderPath(path)}${file}`, null, '_large'));
      let readableStream = fs.createReadStream(`${getFolderPath(path)}${file}`, 'utf8');
      let data = '';
      readableStream.on('data', function (chunk) {
        data += chunk + '\n'; //only for small files
      });
      readableStream.on('end', function () {
        writeDataToStream(data, writerableStream, 4000);
      });
    });
  });
}

function generateCSV(path = './data/test.csv') { /* babel-node ./utils/streams.js -a generateCSV */
  let headers = 'Column1,Column2,Column3';
  let content = `value1,value2,value3\nvalue4,value5,value6\nvalue7,value8,value9\n`;
  const writableStream = fs.createWriteStream(path);
  writableStream.write(headers + '\n');
  writeDataToStream(content, writableStream, 1000);
}

/* CSS Bundler */
function simpleCssBundler(fPath, resultFileName = 'bundler.css') { /* 8, babel-node -- ./utils/streams.js -a cssBundler -p ./data/css */
  if (fs.existsSync(fPath)) {
    const folderPath = getFolderPath(fPath);
    const writeStream = fs.createWriteStream(`${getFolderPath(folderPath)}${resultFileName}`);
    let cssFiles = fs.readdirSync(folderPath).filter( file => path.extname(file) === '.css');
    
    multiStream([...cssFiles.map(
      file => {
        console.log(`${getFolderPath(folderPath)}${file}`);
        return fs.createReadStream(`${getFolderPath(folderPath)}${file}`, 'utf8');
      }
    ), request(BASE_CSS_URL)]).pipe(writeStream);
  } else console.log('Path is not found');
}
