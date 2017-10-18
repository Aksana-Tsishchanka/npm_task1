/* second solution for CssBundler */
import request from 'request';
import fs from 'fs';
import path from 'path';

function asyncOrderedWrite(cssFiles, writableStream, pathFolder, additionalStream = () => {}) {
  if (cssFiles.length === 0) {
    additionalStream(writableStream);
    return;
  }
  let remainingCssFiles = cssFiles.splice(1);
  let cssFile = cssFiles[0];
  const readableStream = fs.createReadStream(`${pathFolder}${cssFile}`, 'utf8');
  
  readableStream.on('data', function(chunk) {
    writableStream.write(chunk + "\n");
  });
  
  readableStream.on('end', function() {
    asyncOrderedWrite(remainingCssFiles, writableStream, pathFolder, additionalStream);
  });
}

async function combineCSSFiles(pathFolder, resultFileName, writableStream, additionalStream) {
  fs.readdir(pathFolder, (err, files) => {
    const cssFiles = files.filter(file => path.extname(file) === '.css' && file !== resultFileName);
    asyncOrderedWrite(cssFiles, writableStream, pathFolder, additionalStream);
  });
}

function getCssFromWeb(url, writableStream) {
  request(url).on('data', function(chunk) {
    writableStream.write(chunk);
  });
}
/* eslint-disable */
export function cssBundler(path, resultFileName = 'bundle.css') { /* 8, babel-node -- ./utils/streams.js -a cssBundler -p ./data/css */
  if (fs.existsSync(path)) {
    const folderPath = getFolderPath(path);
    const writableStream = fs.createWriteStream(`${getFolderPath(folderPath)}${resultFileName}`);
    combineCSSFiles(folderPath, resultFileName, writableStream, getCssFromWeb);
    console.log(`${resultFileName} was bundled`);
    
  } else console.log('Please specify correct folder path');
}