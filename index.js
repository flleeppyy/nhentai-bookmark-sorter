const fs = require('fs');
const readline = require('readline');
const request = require('request');
const rl = readline.createInterface({
  input: fs.createReadStream('test.txt', 'latin1'),
  crlfDelay: Infinity
});

let url;
let t; //in progress title
let title;

let newbody
rl.on('line', (line) => {
  
  if (line.includes("<DT><A HREF=")){
    //console.log(`Line from file: ${line}`);
    url = line.split('HREF="')[1].split('" ADD_DATE')[0]; /* I could have just checked for a trailing slash instead of splitting at '" ADD_DATE' but some may not have a trailing slash in some instances*/
    t = line.split('">')[1].split('</A>')[0];
    title = t.replace('Â','').replace('&#39;',"'").replace('&amp;#039;', "'").replace('&quot;', '"').replace('&amp;', "&").replace('&lt;','<').replace('&gt;', '>'); //holy fuck
    console.log(`Title: ${title}\nURL: ${url}`);

    request.get(url, (error, resp, body) => {
        newbody = body.split('window._gallery = JSON.parse(')[1].split(');')[0];
        galleryjson = JSON.parse(newbody);
        console.log(galleryjson['num_pages']); 
    })
  }

});