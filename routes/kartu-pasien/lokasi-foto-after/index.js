const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/kartu-pasien/lokasi-foto-after")
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }, 3000);

router.get("/", async function (req, res, next) {
  try {
    let q = `SELECT TOP 100 *FROM tblPerawatanLokasiFotoAfter
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblFotoAfter')`;

    const querydata = await sqlkp.query(q);

    if (querydata[0]) {
      let dataArray = "";
      querydata.forEach((items) => {
        dataArray += `(
          '${items.NoAuto}',
          '${items.NoAutoPerawatan}',
          '${items.Keterangan}',
          '${items.UserEntry}',
          '${items.LoginComp.substring(0, items.LoginComp.trim().length - 4)}',
          '${items.CompName.substring(0, items.CompName.trim().length - 4)}',
          '${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.LokasiFotoAfter}',
          '${moment(moment(items.TglAuto)).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      await axios
        .post(
          "http://localhost:3000/api/kartu-pasien/lokasi-foto-after/data/",
          { data: dataFinal }
        )
        .then(async function (response) {
          try {
            const lastsync = await axios.get(
              "http://localhost:3000/api/kartu-pasien/lokasi-foto-after/waktu"
            );
            WaktuTerakhirSync = lastsync.data.data;
            let querydata = await sqlkp.execute(
              `UPDATE "timeAnchor" set
              "time" = '${WaktuTerakhirSync}' 
              WHERE tablekey='tblFotoAfter';`
            );
            res.json({ status: querydata, data: dataFinal });
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
