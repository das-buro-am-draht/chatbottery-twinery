const Deploy = require("ftp-deploy");

const ftpDeploy = new Deploy();

const config = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER_NAME,
  password: process.env.FTP_PASSWORD,
  port: 22,
  localRoot: `${__dirname}/dist/web`,
  remoteRoot: `${process.env.FTP_REMOTE_FOLDER}/${process.env.CONTEXT}/${process.env.HEAD}`,
  include: ["*"],
  deleteRemote: false,
  sftp: true,
};
ftpDeploy.on("uploading", function (data) {
  data.totalFilesCount;
  data.transferredFileCount;
  data.filename;
});
ftpDeploy.on("uploaded", function (data) {
  console.log(data);
});
ftpDeploy.on("log", function (data) {
  console.log(data);
});
ftpDeploy.on("upload-error", function (data) {
  console.log(data.err);
});
ftpDeploy.deploy(config, function (err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log("finished:", res);
  }
});