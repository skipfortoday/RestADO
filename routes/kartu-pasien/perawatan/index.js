const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/kartu-pasien/perawatan")
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
    const checkData = await sqlkp.query(`SELECT TOP 1 *FROM tblPerawatan
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblPerawatan')`);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
          '${items.NoAuto}',
          '${items.NKP}',
           ${
             items.NoUrutTreatment == null ? null : `'${items.NoUrutTreatment}'`
           },
          '${moment(items.TglTreatment).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.Nama}',
          '${items.Alamat}',
          '${items.TelpRumah}',
          '${items.HP}',
          '${items.Anamnesa}',
          '${items.Pagi}',
          '${items.Sore}',
          '${items.Malam}',
          '${items.Terapy}',
          '${items.NamaDokterKonsul}',
          '${items.NamaDokter}',
          '${items.NamaBA}',
          '${items.Status}',
          '${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.Keterangan}',
          '${items.UserEntry}',
          '${items.LoginComp.replace("\x00", "")}',
          '${items.CompName.replace("\x00", "")}',
          '${items.PasienLama}',
          '${items.Exported}',
          '${items.CallPasien}',
          '${moment(items.CallDate).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.CallTime).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.CallKet}',
          '${items.CallPasienResep}',
          '${items.IDJenisPerawatan}',
          '${moment(items.TglAuto).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      //Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/perawatan/data/",
        { data: dataFinal }
      );

      //Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/perawatan/waktu"
      );

      //Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblPerawatan';`);

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
