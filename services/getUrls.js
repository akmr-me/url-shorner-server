const URL = require("../models/urlModel");
module.exports = async function getUrls({
  guestId,
  userId,
  page = 1,
  limit = 10,
  status = "active",
}) {
  const totalUrls = await URL.countDocuments({
    ...(userId ? { userId } : { guestId }),
    status,
  });

  const totalPages = Math.ceil(totalUrls / limit);
  const urls = await URL.find({
    ...(userId ? { userId } : { guestId }),
    status,
  })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  const response = {
    data: urls,
    hasMore: page < totalPages,
    currentPage: parseInt(page),
    totalPages: totalPages,
    totalUrls: totalUrls,
  };
  return response;
};
