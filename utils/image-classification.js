const got = require("got");
const fs = require("fs");
const FormData = require("form-data");

const classify = async (url) => {
  try {
    const filePath = `./build${url}`;
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));
    const response = await got.post("https://api.imagga.com/v2/tags", {
      body: formData,
      username: process.env.APIKEYIMAGGA,
      password: process.env.APISECRETIMAGGA,
    });
    return response.body;
  } catch (error) {
    console.log(error.response.body);
  }
};

module.exports = classify;
