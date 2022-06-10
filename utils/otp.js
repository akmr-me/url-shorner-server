module.exports = function () {
  // function genrateOTP() {
  return ((Math.random() * (9999 - 1001)) | 0) + 1000;
  // }
  // return genrateOTP();
};
