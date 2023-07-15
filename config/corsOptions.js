const whitelist = [
  "http://localhost:4002",
  "http://127.0.0.1:8080",
  "https://www.akmr.me",
];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    // Axios option withCredentils to be set true if wants to save cookie in cookie storage
    // And with withCredentials set and Without Acess-Control-Allow-Credentials to true :Cors issue cors issue
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false, credentials: false };
  }
  //optionsSuccessStatus: 200,
  callback(null, corsOptions);
};

module.exports = corsOptionsDelegate;

//  Access to XMLHttpRequest at 'http://localhost:4000/login' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by cors"));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: function (origin, callback) {
//     console.log(origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by cors"));
//     }
//   },
// // };
