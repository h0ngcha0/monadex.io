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

function wrapComment(str, srcStr) {
  var beginComment = "\n<!-------- inserted by assembly.js from " + srcStr +
    " begin -------->\n\n",
      endComment   = "\n<!-------- inserted by assembly.js from " + srcStr +
    " end -------->\n";

  return beginComment + str + endComment;
};

function insertLocalFiles(data, tagRegex, srcRegex, wrapFun) {
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
                      return wrapComment(wrapFun(hrefData), srcStr);
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

function jsWrap(str) {
  var beginScript  = "<script type=\"text/javascript\">",
      endScript    = "</script>";
  return beginScript + str + endScript;
};

function cssWrap(str) {
  var beginStyle = "<style type=\"text/css\" media=\"screen\">",
      endStyle   = "</style>";
  return beginStyle + str + endStyle;
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

  var newData0 = insertLocalFiles(data, scriptRegex, srcRegex, jsWrap);
  var newData  = insertLocalFiles(newData0, cssLinkRegex, hrefRegex, cssWrap);
  console.log(newData);
});
