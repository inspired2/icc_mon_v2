const { parentPort } = require("worker_threads");
const fs = require("fs");
//const path = require("path");
const gm = require("gm");
const ExifReader = require("exifreader");

let profilePath, outputProfile;

parentPort.on("message", async job => {
  try {
    //console.log("worker recieved job", job.id);
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
        //console.log("worker sending result", id);
        parentPort.postMessage({ id, wrongProfile: res });
      });
  } catch (e) {
    console.log(e);
  }
});

async function getProfileDescriptor(file) {
  const buffer = fs.readFileSync(file);
  if (buffer) {
    const tags = ExifReader.load(buffer, { expanded: true });
    if (tags.icc) {
      return tags.icc["ICC Description"].value;
    } else return "unknown profile";
  } else {
    return Error("could not read file: ", file);
  }
}
async function convertProfile(file) {
  return new Promise((resolve, reject) => {
    //console.log("gm writing file", file);
    gm(file)
      .profile(profilePath)
      .intent("perceptual")
      .write(file, err => {
        if (!err) resolve("ok");
        else reject(err);
      });
  });
}
function isConvertPending(profileDesc) {
  //console.log(outputProfile);
  if (profileDesc == outputProfile) return false;
  else return profileDesc;
}
