const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

if (isMainThread) {
  module.exports = function databaseUpdate() {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: true });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        console.log("exit with code: " + code);
      });
    });
  };
} else {
  const { connectDB, closeConnection } = require("../../DB/mongoDB");
  connectDB();
  const ShortUrl = require("../../models/urlModel");
  const Token = require("../../models/expireToken");

  (async function () {
    let CurrentDate = Date.now();

    urlDeletionCount = await ShortUrl.deleteMany({
      lastClicked: { $lt: CurrentDate - 1000 * 60 * 10 * 24 * 30 }, // 30 days
    }); //change
    tokenDeletionCount = await Token.deleteMany({
      date: { $lt: CurrentDate / 1000 }, //Jwt time is in seconds
    });

    parentPort.postMessage({
      CurrentDate,
      urlDeletionCount,
      tokenDeletionCount,
    });
    closeConnection(); //if Not close worker will also not exit
  })();
}
