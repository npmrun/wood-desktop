import { contextBridge, ipcRenderer, webContents } from "electron"

function getIcons() {
    var links = document.getElementsByTagName('link');
    var icons = [];
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        //Technically it could be null / undefined if someone didn't set it!
        //People do weird things when building pages!
        var rel = link.getAttribute('rel');
        if (rel) {
            //I don't know why people don't use indexOf more often
            //It is faster than regex for simple stuff like this
            //Lowercase comparison for safety
            if (rel.toLowerCase().indexOf('icon') > -1) {
                var href = link.getAttribute('href');
                //Make sure href is not null / undefined            
                if (href) {
                    //Relative
                    //Lowercase comparison in case some idiot decides to put the 
                    //https or http in caps
                    //Also check for absolute url with no protocol
                    if (href.toLowerCase().indexOf('https:') == -1 && href.toLowerCase().indexOf('http:') == -1
                        && href.indexOf('//') != 0) {
                        //This is of course assuming the script is executing in the browser
                        //Node.js is a different story! As I would be using cheerio.js for parsing the html instead of document.
                        //Also you would use the response.headers object for Node.js below.
                        var absoluteHref = window.location.protocol + '//' + window.location.host;
                        if (window.location.port) {
                            absoluteHref += ':' + window.location.port;
                        }
                        //We already have a forward slash
                        //On the front of the href
                        if (href.indexOf('/') == 0) {
                            absoluteHref += href;
                        }
                        //We don't have a forward slash
                        //It is really relative!
                        else {
                            var path = window.location.pathname.split('/');
                            path.pop();
                            var finalPath = path.join('/');
                            absoluteHref += finalPath + '/' + href;
                        }
                        icons.push(absoluteHref);
                    }
                    //Absolute url with no protocol
                    else if (href.indexOf('//') == 0) {
                        var absoluteUrl = window.location.protocol + href;
                        icons.push(absoluteUrl);
                    }
                    //Absolute
                    else {
                        icons.push(href);
                    }
                }
            }
        }
    }
    return icons
}
ipcRenderer.sendToHost("start-load-info")

window.addEventListener('DOMContentLoaded', () => {
    const favicons = getIcons()
    const decodeInfo = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
        favicon: favicons[0]
    }
    console.log("解析信息：", decodeInfo)
    ipcRenderer.sendToHost("stop-load-info", decodeInfo)
})

const aa = document.createElement("div")
aa.innerText = "aaaaaaaaaaa"
// document.body.appendChild(aa)

setTimeout(() => {
    // document.body.appendChild(aa)
    new Image().src = "https://picx.zhimg.com/70/v2-b96a79c7a2a02efabbd75613db8e8ead_1440w.awebp?source=172ae18b&biz_tag=Post"; 
}, 2000);
window.addEventListener('DOMContentLoaded', () => {
    console.log("333");
})