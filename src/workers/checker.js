const { parentPort } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const gm = require("gm");
const ExifReader = require("exifreader");
const settings = require("../../modules/settingsReader")();
const { pathToProfile, outputProfile } = settings;
const sharp = require("sharp");

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
      return Promise.resolve({ ...job, result: e });
    }
  },
  async batchConvert(job) {
    console.log("starting converter");
    const { image } = job;
    return await sharpConvert(image);
  },
  async getMeta(job) {
    const { image } = job;
    const tags = getProfileDescriptor(image);
    return await tags.then(res => {
      return Promise.resolve({ image, icc: res });
    });
  }
};
async function sharpConvert(imagePath) {
  const parsedPath = path.parse(imagePath);
  const outputPath = composePath(parsedPath);
  try {
    await sharp(imagePath)
      .jpeg({
        quality: 100
      })
      .withMetadata({ icc: pathToProfile })
      .toFile(outputPath);
    return { image: imagePath, result: "ok" };
  } catch (e) {
    return { image: imagePath, result: `error: ${e}` };
  }
}

parentPort.on("message", async job => {
  console.log("worker recieved job: ", job);
  await methods[job.type](job).then(res => {
    console.log("worker complete job, sending res to TM:", res);
    parentPort.postMessage(res);
  });
});

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
  try {
    await gm(file)
      .profile(pathToProfile)
      .intent("relative")
      .write(file, err => {
        if (!err) return "ok";
        else throw err;
      });
  } catch (err) {
    return err;
  }
}
function isConvertPending(profileDesc) {
  if (profileDesc == outputProfile) return false;
  else return profileDesc;
}
function composePath(parsedPathObj, counter = "") {
  const outputPath =
    path.join(
      parsedPathObj.dir,
      parsedPathObj.name + counter + parsedPathObj.ext.substring(1)
    ) + ".jpg";
  if (!fs.existsSync(outputPath)) return outputPath;
  counter = "" + (+counter + 1);
  return composePath(parsedPathObj, counter);
}
