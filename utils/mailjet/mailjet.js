const config = require("../../config/index");
const winston = require("../logger/logger");
const html = require("./html");
const mailjet = require("node-mailjet").connect(
  config.mailjet.keys.api,
  config.mailjet.keys.secret
);

const sendMail = (data) => {
  let request = mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: config.mailjet.sender.email,
            Name: config.mailjet.sender.name,
          },
          To: [
            {
              Email: data.to || config.mailjet.sender.email,
              Name: data.to ? data.to.split("@")[0] : "Developer",
            },
          ],
          Subject: data.subject || "This is from Url Shortner",
          TextPart: `${data.message}`,
          HTMLPart: data.otp
            ? html(data.otp)
            : `<div><h1>${data.subject}</h1><p>${data.message} </p></div>`,
          CustomId: "This is custom ID from url-shortneer",
        },
      ],
    })
    .then((res) => {
      winston.log(res.body.Messages[0].Status);
    })
    .catch((e) => {
      //must handle this else this will give unhandledPromise and in unhandled promise if we invoke mailjet then mailjet then this will make a loop
      winston.error(e.response);
    });
};

module.exports = sendMail;
