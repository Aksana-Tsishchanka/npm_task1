import Argv from 'yargs';
import fs from 'fs';
import through from 'through2';
import csvjson from 'csvjson';
import path from 'path';
import request from 'request';

const BASE_CSS_URL = 'https://www.epam.com/etc/clientlibs/foundation/main.min.fc69c13add6eae57cd247a91c7e26a15.css';

const actions = {
  io: inputOutput,
  transform,
  csvToJsonStream,
  csvToJsonFile,
  cssBundler,
  generateTestCSS
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
    .demandOption(['action'])
    .option('action', {
      alias: 'a',
      describe: 'choose an action',
      choices: ['io', 'transform', 'csvToJsonStream', 'csvToJsonFile', 'cssBundler', 'generateTestCSS']
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
  
  if (argv.action) {
    if(argv.action === 'cssBundler') actions[argv.action](argv.path);
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

function csvToJsonStreamTransform(buffer, encoding, next) {
  let options = {
    delimiter : ',',
    quote     : '"'
  };
  this.push(JSON.stringify(csvjson.toObject(buffer.toString(), options)));
  next();
}

function csvToJsonStream(filePath) { /* 6, babel-node ./utils/streams.js -a csvToJsonStream -f ./data/test.csv */
  if (fs.existsSync(filePath) && path.extname(filePath) === '.csv') {
    const readableStream = fs.createReadStream(filePath);
    readableStream.setEncoding('utf8');
    readableStream
      .pipe(through(csvToJsonStreamTransform))
      .pipe(process.stdout);
  }
  else console.log('Please specify correct file path');
}

function createFilePath(filePath, extension = '.json', name) {
  const pathJsonFile = path.parse(filePath);
  
  pathJsonFile.ext = extension;
  pathJsonFile.base = `${pathJsonFile.name || name}${pathJsonFile.ext}`;
  return path.format(pathJsonFile);
}

function csvToJsonFile(filePath) { /* 7, babel-node ./utils/streams.js -a csvToJsonFile -f ./data/test.csv */
  if (fs.existsSync(filePath) && path.extname(filePath) === '.csv') {
    const readableStream = fs.createReadStream(filePath);
    readableStream.setEncoding('utf8');
    const fileName = createFilePath(filePath);
    const writableStream = fs.createWriteStream(fileName);
    readableStream
      .pipe(through(csvToJsonStreamTransform, () => {
        console.log(`${fileName} was generated`);
      }))
      .pipe(writableStream);
  }
  else console.log('Please specify correct file path');
}

function asyncOrderedWrite(cssFiles, writerableStream, pathFolder, additionalStream = () => {}) {
  if (cssFiles.length === 0) {
    additionalStream(writerableStream);
    return;
  }
  let remainingCssFiles = cssFiles.splice(1);
  let cssFile = cssFiles[0];
  const readableStream = fs.createReadStream(`${pathFolder}${cssFile}`);
  readableStream.setEncoding('utf8');
  
  readableStream.on('data', function(chunk) {
    writerableStream.write(chunk + "\n");
  });
  
  readableStream.on('end', function() {
    asyncOrderedWrite(remainingCssFiles, writerableStream, pathFolder, additionalStream);
  });
}

/* generate test files */
function generateTestCSS(path = './data/test') {
  fs.readdir(path, (err, files) => {
    files.forEach(file => {
      console.log(createFileName(`${getFolderPath(path)}${file}`, null, '_large'));
      const writerableStream = fs.createWriteStream(createFileName(`${getFolderPath(path)}${file}`, null, '_large'));
      let readableStream = fs.createReadStream(`${getFolderPath(path)}${file}`, 'utf8');
      let data = '';
      readableStream.on('data', function (chunk) {
        data += chunk;
      });
      readableStream.on('end', function () {
        writeDataToStream(data, writerableStream, 400000);
      });
    });
  });
}

function writeDataToStream(data,writerableStream, count) {
  if (count === 0) return;
  writerableStream.write(data, function() {
    let before = process.memoryUsage().rss;
    writeDataToStream(data,writerableStream, --count);
    console.log('memory increased by', Math.round((process.memoryUsage().rss - before) / 1024 / 1024), 'MB');
  });
}

/* CSS Bundler */
async function combineCSSFiles(pathFolder, resultFileName, writerableStream, additionalStream) {
  fs.readdir(pathFolder, (err, files) => {
    const cssFiles = files.filter(file => path.extname(file) === '.css' && file !== resultFileName);
    asyncOrderedWrite(cssFiles, writerableStream, pathFolder, additionalStream);
  });
}

function getCssFromWeb(writerableStream) {
  request(BASE_CSS_URL).on('data', function(chunk) {
    writerableStream.write(chunk);
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

function cssBundler(path, resultFileName = 'bundle.css') { /* 8, babel-node -- ./utils/streams.js -a cssBundler -p ./data/css */
  if (fs.existsSync(path)) {
    const folderPath = getFolderPath(path);
    const writerableStream = fs.createWriteStream(`${getFolderPath(folderPath)}${resultFileName}`);
    combineCSSFiles(folderPath, resultFileName, writerableStream, getCssFromWeb);
    console.log(`${resultFileName} was bundled`);
    
  } else console.log('Please specify correct folder path');
}
