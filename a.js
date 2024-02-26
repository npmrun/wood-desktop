const path = require("path")

try {
    let name = "@parcel/watcher"
    console.log(require(name));
} catch (error) {
    console.log(error);
}
console.log(path.parse(process.cwd()).name);
console.log(path.normalize(process.cwd()))
console.log(path.normalize("D:/@code/@project/electron-template/"))