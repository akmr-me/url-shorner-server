const URL = require("../models/urlModel");
const User = require("../models/userModel");

const getURL = async (urls, email) => {
  // Array which will have all shorturl to be deleted
  const delArr = [];
  // array.map takes async callback but returns array of Promises So use Promise.all()
  // We can not use return null/udefined in map so use of filter
  const PromisedURLs = urls.map(async (short, i) => {
    const url = await URL.findOne({ short: short });

    if (url == null) {
      delArr.push(short);
      return;
    } else {
      return {
        id: i + 1,
        short: url.short,
        full: url.fullUrl,
        clicks: url.clicks,
        lastClicked: url.lastClicked,
      };
    }
  });
  const urlArr = await Promise.all(PromisedURLs);

  const deleteCount = await User.updateOne(
    { email, email },
    {
      $pull: {
        urls: {
          $in: [...delArr],
        },
      },
    }
  );

  return urlArr.filter((url) => url);
};

module.exports = getURL;
