const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/kartu-pasien/dokter")
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }, 3000);

router.get("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblDokter
       WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999'
        FROM timeAnchor Where tablekey='tblDokter');
            `);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
                  '${items.IDDokter}',
                  ${items.NamaDokter == null ? null : `'${items.NamaDokter}'`},
                  ${items.Status == null ? null : `'${items.Status}'`},
                  ${items.Exported == null ? null : `'${items.Exported}'`},
                  '${moment(items.TglAuto).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();
      console.log(dataFinal);
      //Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/dokter/data/",
        { data: dataFinal }
      );

      //Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/dokter/waktu"
      );

      //Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblDokter';`);

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Sinkron Data",
        waktu: getTimeAnchor.data.data,
      });
    } else {
      res.status(204).json({
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
