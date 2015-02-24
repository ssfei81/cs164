var interpret = require('./interpreter.js').interpret;
var rparse = require('./rparse.js').rparse;
var fs = require('fs');

if (process.argv.length != 3) {
  return console.log('Please give one argument, the input filename.');
}

var grammarFile = 'cs164.grm';
var inputFile = process.argv[2];
var files = ['./library.164','./object.164', inputFile];

fs.readFile(grammarFile, 'utf8', function(err, grammarFileContent) {
  if (err) { return console.log(err); }

  var fileContents = [];
  var readFiles = function(files) {
    var file, remainingFiles;
    if (files.length > 0) {
      file = files.shift();
      remainingFiles = files;
    }
    else { //no more files to read, ready to parse and interpret
      //rparse(fileContents, null, 'cs164Server.grm', function(asts) {
      rparse(fileContents, grammarFileContent, null, function(asts) {
        interpret(asts, function(x) {
          console.log(x);
        });
      });
      return;
    }
    fs.readFile(file, 'utf8', function(err, fileContent) {
      if (err) { return console.log(err); }
      fileContents.push(fileContent);
      readFiles(remainingFiles);
    });
  }
  readFiles(files);
});
