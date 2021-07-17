const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

setInterval(function () {
  axios
    .get("http://localhost:4000/kartu-pasien/ba")
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.get("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblBA JOIN flagBA ON tblBA.IDBA = flagBA.flagIDBA WHERE flagBA.flagPush = 0;`);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
                  '${items.IDBA}',
                  ${items.NamaBA == null ? null : `'${items.NamaBA}'`},
                  ${items.Status == null ? null : `'${items.Status}'`},
                  ${items.Exported == null ? null : `'${items.Exported}'`},
                  '${moment(items.TglAuto).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      //Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/ba/data/",
        { data: dataFinal }
      );

      //Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/ba/waktu"
      );

      //Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblBA';`);

      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpBA" FROM "tblBA";
      INSERT INTO "#tmpBA"
                  ("IDBA", "NamaBA", "Status", "Exported" , TglAuto) VALUES ${dataFinal};
      MERGE flagBA AS Target
      USING (SELECT * FROM #tmpBA) AS Source
          ON (Target.flagIDBA = Source.IDBA)
          WHEN MATCHED THEN
               UPDATE SET Target.flagPush = 1;`);

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
