"use strict";
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const gm = require("gm");
const ExifReader = require("exifreader");
const EventEmitter = require("events");
const emitter = new EventEmitter();

const dirToWatch = "X:/";
const errPath = "errorLog.txt";

const watcher = chokidar.watch(dirToWatch, {
  ignored: path.join(dirToWatch, "!!!Рабочая"),
  depth: 0,
  usePolling: true,
  persistent: true,
  awaitWriteFinish: true,
  ignoreInitial: true,
  ignorePermissionErrors: true
});

let checked = document.querySelector("#checked");
let toConvert = document.querySelector("#found");
let converted = document.querySelector("#converted");

emitter.on("checkedImg", () => {
  console.log("checked " + counter.imagesChecked + " images");
  checked.textContent = counter.imagesChecked;
});
emitter.on("imgToConvert", () => {
  console.log("images being converted: " + counter.imagesToConvert);
  toConvert.textContent = counter.imagesToConvert;
});
emitter.on("convertedImg", () => {
  console.log("converted images: " + counter.convertedImages);
  converted.textContent = counter.convertedImages;
});
emitter.on("newOrder", dir => {});

let counter = {
  imagesChecked: 0,
  imagesToConvert: 0,
  convertedImages: 0,
  setImgCheked: function() {
    this.imagesChecked++;
    emitter.emit("checkedImg");
  },
  setImgToConvert: function() {
    this.imagesToConvert++;
    emitter.emit("imgToConvert");
  },
  setConvertedImg: function() {
    this.convertedImages++;
    emitter.emit("convertedImg");
  }
};

export default { counter };

watcher
  .on("addDir", dir => {
    emitter.emit("newOrder", dir);
    startDirWatcher(dir);
    console.log("Папка с заказом: " + dir);
  })
  .on("error", error => {
    console.log(error);
    writeError(error);
  });

function checkExt(file) {
  let ext = path.parse(file).ext.toLowerCase();
  if (ext == ".jpg" || ext == ".tif" || ext == ".jpeg" || ext == ".tiff") {
    console.log(`found: ${path.basename(file)}, checking profile:`);
    counter.setImgCheked();
    tags(file)
      .then(data => {
        console.log(data);
        decide(data, file);
      })
      .catch(err => {
        console.log(err);
        writeError(err);
      });
  }
}

function tags(file) {
  let tags = ExifReader.load(fs.readFileSync(file), { expanded: true });

  return new Promise(function(resolve, reject) {
    let profile = {};

    if (tags.icc) profile.icc = tags.icc["ICC Description"].value;
    else profile.icc = undefined;

    if (tags.exif) profile.space = tags.exif.ColorSpace.description;
    else profile.space = undefined;

    if (!profile.icc && !profile.space) profile = undefined;

    resolve(profile);
  });
}

function decide(profile, file) {
  let regExp = /[sS][rR][gG][bB]/gm;
  let regExpAdobe = /[aA][dD][oO][bB][eE]\s*[rR][gG][bB]/gm;
  if (
    profile &&
    profile.icc &&
    !regExp.test(profile.icc) &&
    !regExpAdobe.test(profile.icc)
  ) {
    console.log("converting profile for " + path.basename(file));
    counter.setImgToConvert();
    converter(file);
  }
}

function converter(filePath) {
  gm(filePath)
    .profile("sRGB.icm")
    .intent("relative")
    .write(filePath, err => {
      counter.setConvertedImg();
      if (err) writeError(err);
    });
}

function writeError(error) {
  let date = new Date();
  let errorData = `\n ${date}\n + ${error} \n\r`;
  fs.appendFile(errPath, errorData, "utf8", err => {
    if (err) console.log("cannot write error to file: " + errPath);
  });
}

function startDirWatcher(subDir) {
  const subWatcher = chokidar.watch(subDir, {
    ignored: /[/\\]\./,
    persistent: false,
    awaitWriteFinish: true,
    ignorePermissionErrors: true,
    usePolling: true
  });
  subWatcher
    .on("add", file => {
      checkExt(file);
    })
    .on("error", error => {
      console.log(error);
      writeError(error);
    });
}
