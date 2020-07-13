const fs = require('fs');
const readline = require('readline');
const request = require('request');
const requestp = require('request-promise');
const rl = readline.createInterface({
  input: fs.createReadStream('test.txt', 'latin1'),
  crlfDelay: Infinity
});

let url;
let t;
let title;
let type;
let strippedid;

let newbody;
let iurl;

/** 
 * gid: nhentai ID
 * 
 * mediaid: nhentai media ID
 * 
 * pages: amount of pages
 * 
 * name: name of doujin (optional)
 * 
 * this is probably the only function youll use,
    just make sure you use the media id, not the nhentai id itself.
    you can check this by opening a gallery and typing "window._gallery['media_id']" into the console (not in quotes ofc)
*/


function dwnldnh(gid, mediaid, pages, name){ 
    console.log(gid, mediaid, pages, name)
    function statusthing(st, type) {
        if(st == 404) { console.error(`${iurl}/${mediaid}/1.png ${st}`)} else if(st == 500 || st == 502 || st == 503) { console.error("Remote Server encountered error", st)} else if (st == 200) {console.error(`${iurl}/${mediaid}/1.png ${st}`); fuckthis(type); type = "jpg"}
    }
    if(!gid) {throw "No gallery ID provided"} else if (!mediaid) { throw "No media ID provided" } else if (!pages) { throw "No amount of pages provided"};
    iurl = "https://i.nhentai.net/galleries";
    mediaid = mediaid.replace(/\W/g, ''); // i have no idea how to use regex, i just pulled this from SOF
    request.get(`${iurl}/${mediaid}/1.png`, (error, resp, body) => {
        type = "png";
        let st = resp.statusCode;
        statusthing(st, type)
    })
    request.get(`${iurl}/${mediaid}/1.jpg`, (error, resp, body) => {
        type = "jpg";
        let st = resp.statusCode;
        statusthing(st, type)
    })

    function fuckthis(type) {
        console.log(type)
         if (type == "png" || type == "jpg") {
            console.log("did type if")
            let string;
            let x = 1;
            console.log(x)
            while(pages > x) { // THIS DOES NOT WORK, IT DOWNLOADS THE FIRST PAGE AND THE LAST PAGE ONLY AND ITS FUCKING BULLSHTI 🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕
                console.log("making request")

                requestp.get({url: `${iurl}/${mediaid}/${x}.${type}`, encoding: null}).then(function(res) {
                    //console.log('content-type:', res.headers['content-type']);
                    //console.log('content-length:', res.headers['content-length']);
                    string = Boolean(name) ? `./doujins/${gid} - ${name}` : `./doujins/${gid}`;
                    if (!fs.existsSync(string)){
                        fs.mkdirSync(string);
                    }
                    const buffer = Buffer.from(res, 'utf8');
                    fs.writeFileSync(`${string}/${x}.${type}`, buffer);
                }).catch(err => {console.log(err)})
                x++;
                console.log(x)
            }
        }
    }
}


rl.on('line', (line) => {
  
  if (line.includes("<DT><A HREF=")){
    //console.log(`Line from file: ${line}`);
    url = line.split('HREF="')[1].split('" ADD_DATE')[0]; // I could have just checked for a trailing slash instead of splitting at '" ADD_DATE' but some may not have a trailing slash in some instances
    t = line.split('">')[1].split('</A>')[0];
    title = t.replace('Â','').replace('&#39;',"'").replace('&amp;#039;', "'").replace('&quot;', '"').replace('&amp;', "&").replace('&lt;','<').replace('&gt;', '>'); //holy fuck
    title = title.replace(' » nhentai: hentai doujinshi and manga', '')
    //console.log(`Title: ${title}\nURL: ${url}`);
    strippedid = url.split('/g/')[1].split('/')[0];

    request.get(url, (error, resp, body) => {
        newbody = body.split('JSON.parse(')[1].split(');')[0];
        galleryjson = JSON.parse(JSON.parse(newbody));
        dwnldnh(strippedid, galleryjson['media_id'], galleryjson['num_pages'], title);
    })
  }

});
