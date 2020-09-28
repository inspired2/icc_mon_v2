const { parentPort } = require("worker_threads");
const fs = require("fs");
const gm = require("gm");
const ExifReader = require("exifreader");
const settings = require("../modules/settingsReader")();
const { pathToProfile, outputProfile } = settings;

const methods = {
  async checkImage(job) {
    try {
      const { id, file } = job;
      await getProfileDescriptor(file)
        .then(async descriptor => {
          const result = isConvertPending(descriptor);
          if (result) {
            await convertProfile(file);
          }
          return Promise.resolve(result);
        })
        .then(res => {
          parentPort.postMessage({ id, file, wrongProfile: res });
        });
    } catch (e) {
      console.log(e);
    }
  },
  async batchConvert(job) {
    const { image, options } = job;
    const outputProfile = options.profilePath;
    const fileFormat = options.imageType;
    if(fileFormat === "heic" || fileFormat === "heif") {
      convertHeif(image)
    }
  },
  async getMeta(job) {
    const { image } = job;
    const tags = getProfileDescriptor(image);
    tags.then(res => {
      parentPort.postMessage({ image, icc: res });
    });
  }
};

parentPort.on("message", async job => {
  await methods[job.type](job);
});

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
