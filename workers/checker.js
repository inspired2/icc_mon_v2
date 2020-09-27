const { parentPort } = require("worker_threads");
const fs = require("fs");
const gm = require("gm");
const ExifReader = require("exifreader");

let profilePath, outputProfile;

parentPort.on("message", async job => {
  if (job.type === "convertType") {
    await typeConvert(job.image).then(() => {
      parentPort.postMessage("ok");
    });
  } else {
    await processProfile(job);
  }
});
async function processProfile(job) {
  try {
    profilePath = job.pathToProfile;
    outputProfile = job.outputProfile;
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
}
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
      .profile(profilePath)
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
async function typeConvert(imagePath) {}
