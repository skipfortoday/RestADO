const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

setInterval(function () {
  axios
    .get("http://localhost:4000/kartu-pasien/dokter")
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.get("/", async function (req, res, next) {
  try {
    let q = `
    SELECT TOP 100 
    IDDOkter,NamaDokter,Status,Exported,
    CONVERT(date, TglAuto) as dateTglAuto,
    CONVERT(time, TglAuto) as timeTglAuto
    FROM tblDokter
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblDokter');
  `;
    const querydata = await sqlkp.query(q);
    if (querydata[0]) {
      let dataTcard = "";
      querydata.forEach((items) => {
        dataTcard += `(
          '${items.IDDOkter}','${items.NamaDokter}','${items.Status}',
          '${items.Exported}',
          '${items.dateTglAuto} ${items.timeTglAuto.substring(
          0,
          items.timeTglAuto.trim().length - 8
        )}'),`;
      });
      dataTcard = dataTcard.substring(0, dataTcard.trim().length - 1);
      console.log(dataTcard);
      await axios
        .post("http://localhost:3000/api/kartu-pasien/dokter/data/", {
          data: dataTcard,
        })
        .then(async function (response) {
          try {
            const lastsync = await axios.get(
              "http://localhost:3000/api/kartu-pasien/dokter/waktu"
            );
            WaktuTerakhirSync = lastsync.data.data;
            console.log(`UPDATE "timeAnchor" set
            "time" = '${WaktuTerakhirSync}' 
            WHERE tablekey='tblDokter'`);
            let querydata = await sqlkp.execute(
              `UPDATE "timeAnchor" set
              "time" = '${WaktuTerakhirSync}' 
              WHERE tablekey='tblDokter';`
            );
            res.send(querydata);
          } catch (error) {
            res.send(error);
          }
        })
        .catch(function (error) {
          res.send(error);
        });
    } else {
      res.json({
        success: false,
        status: 204,
        message: "Belum ada data untuk sinkron",
        data: false,
      });
    }
  } catch (error) {
    res.send(error);
    console.error(error);
  }
});
module.exports = router;
