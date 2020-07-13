const fs = require('fs');
const readline = require('readline');
const request = require('request');
const requestp = require('request-promise');
const rl = readline.createInterface({
  input: fs.createReadStream('nhentai_loli_bookmarks.html', 'latin1'),
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

    async function fuckthis(type) {
        console.log(type)
         if (type == "png" || type == "jpg") {
            console.log("did type if")
            let string;
            
            //refactor to promise.all by gen
            const promises = []
            let x = 1;
            while(pages > x) {
                promises.push( new Promise((resolve, reject) => {
                    console.log("making request " + x)
                    const num = x
                    requestp.get({url: `${iurl}/${mediaid}/${x}.${type}`, encoding: null}).then(function(res) {
                        //console.log('content-type:', res.headers['content-type']);
                        //console.log('content-length:', res.headers['content-length']);
                        string = Boolean(name) ? `./doujins/${gid} - ${name}` : `./doujins/${gid}`;
                        if (!fs.existsSync('./doujins')){
                            fs.mkdirSync('./doujins');
                        }
                        if (!fs.existsSync(string)){
                            fs.mkdirSync(string);
                        }
                        const buffer = Buffer.from(res, 'utf8');
                        fs.writeFileSync(`${string}/${num}.${type}`, buffer);
                        resolve()
                    }).catch(err => {
                        console.log(err)
                        reject(err)})
                })
                )
                x++;
            }

            Promise.all(promises).then(values => {
                // run this if all requests where successful
                console.error(values)
            })
            .catch(err=>{
                //run this if one or more requests failed
                console.error(err)
            })
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
        console.log(body)
        newbody = body.split('JSON.parse(')[1].split(');')[0];
        galleryjson = JSON.parse(JSON.parse(newbody));
        dwnldnh(strippedid, galleryjson['media_id'], galleryjson['num_pages'], title);
    })
  }

});
