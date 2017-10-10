#!/usr/bin/env node

import { default as Argv } from 'yargs';
import fs from 'fs';
import { default as through } from 'through2';
import csvjson from 'csvjson';
import path from 'path';
import request from 'request';

const BASE_CSS_URL = 'https://www.epam.com/etc/clientlibs/foundation/main.min.fc69c13add6eae57cd247a91c7e26a15.css';

const actions = {
  io: inputOutput,
  transform,
  csvToJsonStream,
  csvToJsonFile,
  cssBundler
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
      choices: ['io', 'transform', 'csvToJsonStream', 'csvToJsonFile', 'cssBundler']
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

function transform() { /* 5, node ./utils/streams.js -a transform */
  stdInInformUser();
  
  let write = function (buffer, encoding, next) {
    this.push(`Transformed to: ${buffer.toString().toUpperCase()}`);
    next();
  };
  
  process.stdin
    .pipe(through(write, end))
    .pipe(process.stdout);
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

function stdInInformUser() {
  process.stdout.write(`Please start typing to transform ...
  to end input use CTRL + D \n`);
  process.stdin.setEncoding('utf8');
}

function csvToJsonStreamTransform(buffer, encoding, next) {
  let options = {
    delimiter : ',',
    quote     : '"'
  };
  this.push(JSON.stringify(csvjson.toObject(buffer.toString(), options)));
  next();
}

function end() {
  process.stdout.write('Transform was completed\n');
}

function createFilePath(filePath, extension = '.json', name) {
  const pathJsonFile = path.parse(filePath);
  
  pathJsonFile.ext = extension;
  pathJsonFile.base = `${pathJsonFile.name || name}${pathJsonFile.ext}`;
  return path.format(pathJsonFile);
}

/* CSS Bundler */
function cssBundler(path, resultFileName = 'bundle.css') { /* 8, babel-node -- ./utils/streams.js -a cssBundler -p ./data/css */
  if (fs.existsSync(path)) {
    const folderPath = getFolderPath(path);
    const writerableStream = fs.createWriteStream(`${getFolderPath(folderPath)}${resultFileName}`);
    combineCSSFiles(folderPath, resultFileName, writerableStream);
    getCssFromWeb(BASE_CSS_URL, writerableStream);
    console.log(`${resultFileName} was bundled`);
  } else console.log('Please specify correct folder path');
}

function combineCSSFiles(pathFolder, resultFileName, writerableStream) {
  fs.readdir(pathFolder, (err, files) => {
    for (let i = 0; i < files.length; i++) {
      if (path.extname(files[i]) === '.css' && files[i] !== resultFileName) {
        let data = '';
        const readableStream = fs.createReadStream(`${pathFolder}${files[i]}`);
        readableStream.setEncoding('utf8');
        
        readableStream.on('data', function(chunk) {
          data+=chunk;
        });
        
        readableStream.on('end', function() {
          i++;
          writerableStream.write(data + "\n");
        });
      }
    }
  });
}

function getCssFromWeb(url, writerableStream) {
  request(url).pipe(writerableStream);
}

function getFolderPath(path) {
  return path[path.length - 1] === "/" ? path : `${path}/`;
}



