#!/usr/bin/node
var fs = require('fs'),
    args = process.argv.splice(2),
    debugFlag = false;

if(args.length != 1){
  help();
  return -1;
}

function help() {
  console.log("usage:\n\tassembly.js FILE");
}

function debug(Str) {
  if (debugFlag) {
    console.log(Str);
  }
};

function wrapComment(Str, SrcStr) {
  var BeginComment = "\n<!-------- inserted by assembly.js from " + SrcStr +
    " begin -------->\n\n";
  var EndComment   = "\n<!-------- inserted by assembly.js from " + SrcStr +
    " end -------->\n";

  return BeginComment + Str + EndComment;
};

function insertLocalFiles(data, tagRegex, srcRegex) {
  var newData = data.replace(tagRegex, function(match) {
                  var srcStr,
                      matchedSrc = match.match(srcRegex);

                  debug("match: " + match);

                  if (matchedSrc) {
                    srcStr = matchedSrc[1];
                  };

                  debug("srcStr: " + srcStr);
                  if (srcStr) {
                    try {
                      hrefData = fs.readFileSync(srcStr);
                      debug("srcData: " + hrefData);
                      return wrapComment(hrefData, srcStr);
                    } catch(readErr) {
                      debug("[info] Skipping " + srcStr);
                      return match;
                    };
                  }

                  debug("Skipping " + srcStr);
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
      cssLinkRegex = /<\s*link[\S\s]*?type=\"text\/css\"[\S\s]*?link\s*>/g,
      hrefRegex    = /href\s*=\s*\"([^\"]*)\"/;

  var newData0 = insertLocalFiles(data, scriptRegex, srcRegex);
  var newData  = insertLocalFiles(newData0, cssLinkRegex, hrefRegex);
  console.log(newData);
});
