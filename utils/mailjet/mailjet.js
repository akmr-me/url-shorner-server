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
          Subject: data.subject || "This is from Linkify",
          TextPart: `${data.message}`,
          HTMLPart: data.otp
            ? html(data.otp)
            : `<div><h1>${data.subject}</h1><p>${data.message} </p></div>`,
          CustomId: "This is custom ID from linkify",
        },
      ],
    })
    .then((res) => {
      winston.info(res.body);
    })
    .catch((e) => {
      //must handle this else this will give unhandledPromise and in unhandled promise if we invoke mailjet then mailjet then this will make a loop
      console.error("Error sending email:", e);
      winston.error(e.response);
    });
};

module.exports = sendMail;
