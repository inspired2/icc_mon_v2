const { parentPort } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const gm = require("gm");
const ExifReader = require("exifreader");
const settings = require("../modules/settingsReader")();
const { pathToProfile, outputProfile } = settings;
const heicConverter = require("heic-convert");

const methods = {
  async checkImage(job) {
    try {
      const { id, file } = job;
      return await getProfileDescriptor(file).then(async descriptor => {
        const result = isConvertPending(descriptor);
        if (result) {
          await convertProfile(file);
        }
        return Promise.resolve({ id, file, wrongProfile: result });
      });
    } catch (e) {
      console.log(e);
    }
  },
  async batchConvert(job) {
    const { image, options } = job;
    console.log("starting converter");
    //const { profilePath, imageType } = options;
    //if (imageType === ".heic" || imageType === ".heif") {
    return await convertHeic(image);
    //}
  },
  async getMeta(job) {
    const { image } = job;
    const tags = getProfileDescriptor(image);
    return await tags.then(res => {
      return Promise.resolve({ image, icc: res });
    });
  }
};

parentPort.on("message", async job => {
  console.log("worker recieved job: ", job);
  await methods[job.type](job).then(res => {
    console.log("worker complete job, sending res to TM:", res);
    parentPort.postMessage(res);
  });
});

async function convertHeic(imagePath, format = "JPEG") {
  try {
    const parsedPath = path.parse(imagePath);
    const outputPath = parsedPath.dir + parsedPath.name + ".jpg";
    const buffer = fs.readFileSync(imagePath);
    const output = heicConverter({ buffer, format });
    await output.then(outputBuffer => {
      fs.writeFileSync(outputPath, outputBuffer);
    });
    console.log("converter working")
    return { image: imagePath, result: "ok" };
  } catch (e) {
    if (e) return { image: imagePath, result: "error" };
  }
}
// eslint-disable-next-line no-unused-vars
async function getProfileDescriptor(file) {
  const buffer = fs.readFileSync(file);
  if (buffer) {
    let tags;
    try {
      tags = ExifReader.load(buffer, { expanded: true });
      if (tags.icc) {
        return tags.icc["ICC Description"].value;
      } else return { tags };
    } catch (e) {
      console.log("error in exifreader", e);
      tags = null;
      return tags;
    }
  } else {
    return Error("could not read file: ", file);
  }
}
async function convertProfile(file) {
  return new Promise((resolve, reject) => {
    gm(file)
      .profile(pathToProfile)
      .intent("relative")
      .write(file, err => {
        if (!err) resolve("ok");
        else reject(err);
      });
  });
}
function isConvertPending(profileDesc) {
  if (profileDesc == outputProfile) return false;
  else return profileDesc;
}
