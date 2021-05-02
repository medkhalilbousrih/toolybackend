const got = require("got");
const fs = require("fs");
const FormData = require("form-data");

const apiKey = "acc_d5b63a8f1b439d0";
const apiSecret = "95319d16977e9304c0d891b83616fdbe";

const classify = async (url) => {
  try {
    const filePath = `./build${url}`;
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));
    const response = await got.post("https://api.imagga.com/v2/tags", {
      body: formData,
      username: apiKey,
      password: apiSecret,
    });
    return response.body;
  } catch (error) {
    console.log(error.response.body);
  }
};

module.exports = classify;
