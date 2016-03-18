# node-compressed-js-fs
Use compressed JS on disk (because size matters sometimes)

# Usage

`npm install compressed-js-fs`

Prepare code by calling compressFile({ filename, replace: true, level }, callback), which will replace .js files with a deflated version.
Note that because this will replace the input files, you should make a copy of your source before running it.

When running the code, require compressed-js-fs before requiring any compressed files.