#!/usr/bin/node
var fs = require('fs'),
    args = process.argv.splice(2);

if(args.length != 1){
  help();
  return -1;
}

function help() {
  console.log("usage:\n\tassembly.js FILE");
}

function wrapComment(Str, SrcStr) {
  var BeginComment = "\n<-------- inserted by assembly.js from " + SrcStr +
    " begin -------->\n\n";
  var EndComment   = "\n<-------- inserted by assembly.js from " + SrcStr +
    " end -------->\n";

  return BeginComment + Str + EndComment;
};

var fileName = args[0];

fs.readFile(fileName, 'utf8', function(err, data) {
  if(err) {
    console.log("Error reading file: " + fileName);
    return -1;
  }
  var scriptRegex = /<\s*script[\S\s]*?script\s*>/g;
  var newData = data.replace(scriptRegex, function(match) {
                  var srcRegex = /src\s*=\s*\"([\s\S]*)\"/;
                  srcStr = match.match(srcRegex)[1];
                  console.log("srcStr: " + srcStr);
                  if (srcStr) {
                    try {
                      srcData = fs.readFileSync(srcStr);
                      console.log("srcData: " + srcData);
                      return "2) " + wrapComment(srcData, srcStr);
                    } catch(readErr) {
                      return "3) " + match;
                    };
                  }

                  return "4) " + match;
                });
  console.log("newData: " + newData);
});
