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

function insertLocalFiles(data, tagRegex, srcRegex) {
  var newData = data.replace(tagRegex, function(match) {
                  var srcStr;

                  if (match.match(srcRegex)) {
                    srcStr = match.match(srcRegex)[1];
                  };

                  console.log("srcStr: " + srcStr);
                  if (srcStr) {
                    try {
                      hrefData = fs.readFileSync(srcStr);
                      console.log("srcData: " + hrefData);
                      return wrapComment(hrefData, srcStr);
                    } catch(readErr) {
                      console.log("[info] Skipping " + srcStr);
                      return match;
                    };
                  }

                  console.log("[info] Skipping " + srcStr);
                  return match;
                });

  return newData;
};

var fileName = args[0];

fs.readFile(fileName, 'utf8', function(err, data) {
  if(err) {
    console.log("Error reading file: " + fileName);
    return -1;
  }
  var scriptRegex  = /<\s*script[\S\s]*?script\s*>/g,
      srcRegex     = /src\s*=\s*\"([^\"]*)\"/,
      cssLinkRegex = /<\s*link[\S\s]*?type\s*=\s*\"[\S\s]*css[\S\s]*"[\S\s]*?link\s*>/g,
      hrefRegex    = /href\s*=\s*\"([^\"]*)\"/;

  var newData0 = insertLocalFiles(data, scriptRegex, srcRegex);
  var newData  = insertLocalFiles(newData0, cssLinkRegex, hrefRegex);
  console.log("newData: " + newData);
});
