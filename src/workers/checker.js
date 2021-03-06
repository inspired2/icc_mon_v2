const { parentPort } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const gm = require("gm");
const ExifReader = require("exifreader");
const sharp = require("sharp");
const heicConvert = require("heic-convert");

let pathToProfile, outputProfile;

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
  let buffer = fs.readFileSync(imagePath);
  const parsedPath = path.parse(imagePath);
  const outputPath = composePath(parsedPath);
  const fileIsHeic = () => {
    imagePath.toLowerCase().includes("heic") ||
      imagePath.toLowerCase().includes("heif");
  };
  if (fileIsHeic) {
    buffer = await heicConvert({ buffer, format: "JPEG", quality: 1 });
  }
  try {
    await sharp(buffer)
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
  outputProfile = job.settings.outputProfile;
  pathToProfile = job.settings.pathToProfile;
  await methods[job.type](job)
    .then(res => {
      parentPort.postMessage(res);
    })
    .catch(() => process.exit(1));
});

async function getProfileDescriptor(file) {
  const buffer = fs.readFileSync(file);
  if (buffer) {
    let tags;
    const descriptor = {};
    try {
      tags = ExifReader.load(buffer, { expanded: true });
      if (tags.icc) {
        descriptor.icc = tags.icc["ICC Description"].value;
      }
      if (tags.exif?.ColorSpace?.description) {
        descriptor.space = tags.exif.ColorSpace.description;
      }
      if (Object.keys(descriptor).length) return descriptor;
      else return { tags };
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
    gm(file)
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
  const regExp = /sRGB\b/;
  if (profileDesc?.icc == outputProfile) return false;
  else if (regExp.test(profileDesc.space) && !profileDesc.icc) return false;
  else return profileDesc; //true
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
