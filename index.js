var fs = require('fs');
var zlib = require('zlib');
var zlibjs = require('zlibjs-slim'); //Using zlibjs for inflateSync on node v0.10.x
var mod = require('module').prototype;
var originalCompile = mod._compile;

var hookInstalled = false;
exports.installHook = function() {
  if (!hookInstalled) {
    mod._compile = function(content, filename) {
      arguments[0] = exports.decompressFile(content, filename);
      //console.log(arguments[0])
      return originalCompile.apply(this, arguments);
    };

    hookInstalled = true;
  }
};

exports.decompressFile = function(content, filename) {
  if (content.charCodeAt(0) === 120) {
    var buffer = new Buffer(fs.readFileSync(filename));

    try {
      return zlibjs.inflateSync(buffer).toString();
    } catch(e) {
      return content;
    }
  }

  return content;
};

exports.compressFile = function(args, callback) {
  var filename = args.filename;
  var level = args.level;
  var replace = args.replace;

  if (filename.indexOf('compressed-js-fs') >= 0) {
    return callback(); //Don't compress yourself, as we wouldn't be able to load this module
  }

  var deflate = zlib.createDeflate({
    level: level || 3
  });

  var writeStream = fs.createWriteStream(filename + '.gz');
  fs.createReadStream(filename).pipe(deflate).pipe(writeStream);

  writeStream.on('close', function() {
    writeStream.removeAllListeners();

    if (replace) {
      fs.rename(filename + '.gz', filename, callback);
    } else {
      callback();
    }
  });

  writeStream.on('error', function(e) {
    writeStream.removeAllListeners();
    callback(e);
  });
};

exports.installHook();

//exports.compressFile(__dirname + '/test.js', false, function(err) {
//  if (err) {
//    throw err;
//  }
//
//  require('./test.js.gz');
//});
