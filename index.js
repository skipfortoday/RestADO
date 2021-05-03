const util = require('util');
const exec = util.promisify(require('child_process').exec);

// var args = '0cuU7Eui8mCbDX4Ls0/TaA';
var args = '0cuU7Eui8mCbDX4Ls0/TVA';

// 0cuU7Eui8mCbDX4Ls0/TVA

//exec('"/path/to/test file/test.sh" arg1 arg2');

exec('"Project1.exe" '+ args, (err, stdout, stderr) => {  
	
// console.log("Testing");

  if (err) {  
    console.error(err);  
    return;  
  }  
  console.log(stderr);
  console.log(stdout);  
});