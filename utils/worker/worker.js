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
  const connetion = require("../../DB/mongoDB")();
  const ShortUrl = require("../../models/urlModel");
  (async function () {
    data = await ShortUrl.deleteMany({
      lastClicked: { $lt: Date.now() - 1000 * 60 * 10 },
    }); //change
    // console.log(data);
    parentPort.postMessage(data);
    connetion.close(); //if Not close worker will also not exit
  })();
}
