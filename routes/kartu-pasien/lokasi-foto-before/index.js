const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/kartu-pasien/lokasi-foto-before")
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
                    SELECT TOP 100 *FROM tblPerawatanLokasiFotoBefore
                    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
                    FROM timeAnchor Where tablekey='tblFotoBefore')
            `);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
          '${items.NoAuto}',
          '${items.NoAutoPerawatan}',
          '${items.Keterangan}',
          '${items.UserEntry}',
          '${items.LoginComp.substring(0, items.LoginComp.trim().length - 4)}',
          '${items.CompName.substring(0, items.CompName.trim().length - 4)}',
          '${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.LokasiFotoBefore}',
          '${moment(moment(items.TglAuto)).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      // Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/lokasi-foto-before/data/",
        { data: dataFinal }
      );

      // Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/lokasi-foto-before/waktu"
      );

      // Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblFotoBefore';`);

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
