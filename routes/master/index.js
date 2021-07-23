const express = require("express");
const axios = require("axios");
const router = express.Router();
var fire = require("../../config/firebase");
var conf = require("../../config/main");
var ref = fire.database().ref(".info/connected");

ref.on("value", (snapshot) => {
  const data = snapshot.val();
  data
    ? axios
        .post(`${conf.appURL}/master`)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        })
    : axios
        .put(`${conf.appURL}/master`)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
});

router.post("/", async function (req, res, next) {
  try {
    //Push Data Ke API untuk di simpan dan di MERGE
    const Online = await axios.post(
      `${conf.baseURL}/master/status/${conf.kodeCabang}`
    );
    res.json(Online.data);
  } catch (error) {
    console.error(error);
  }
});

router.put("/", async function (req, res, next) {
  try {
    const Offline = await axios.post(
      `${conf.baseURL}/master/status/${conf.kodeCabang}`
    );
    res.json(Offline.data);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
