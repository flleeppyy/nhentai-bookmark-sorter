const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('test.txt'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  //console.log(`Line from file: ${line}`);
  console.log(line.split('HREF="')[1].split('" ADD_DATE')[0])
});