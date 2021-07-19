const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();
const conf = require("../../../config/main");

// setInterval(function () {
//   axios
//     .post("http://localhost:4000/kartu-pasien/dokter")
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }, 3000);

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

router.post("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblDokter JOIN flagDokter ON tblDokter.IDDokter = flagDokter.flagIDDokter WHERE flagDokter.flagPush = 0;
            `);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
                  '${items.IDDokter}',
                  ${
                    items.NamaDokter == null
                      ? null
                      : `'${items.NamaDokter.replace("'", "''")}'`
                  },
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
        `${conf.baseURL}/kartu-pasien/dokter/push/${conf.kodeCabang}`,
        { data: dataFinal }
      );

      // //Mendapatkan Waktu Data Terakhir Update
      // const getTimeAnchor = await axios.get(
      //   "http://localhost:3000/api/kartu-pasien/dokter/waktu"
      // );

      // //Update Waktu Acuan ke DB Client
      // const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
      //       "time" = '${getTimeAnchor.data.data}'
      //       WHERE tablekey='tblDokter';`);

      await sqlkp.execute(`
               SELECT Top 0 * INTO "#tmpDokter" FROM "tblDokter"
               INSERT INTO "#tmpDokter"
               ("IDDokter", "NamaDokter", "Status", "Exported" , TglAuto) VALUES ${dataFinal};
               MERGE flagDokter AS Target
               USING (SELECT * FROM "#tmpDokter") AS Source
               ON (Target.flagIDDokter = Source.IDDokter)
               WHEN MATCHED THEN
                   UPDATE SET Target.flagPush = 1 ;`);

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Sinkron Data",
        data: dataFinal,
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

// Pull DataDariServer
router.get("/", async function (req, res, next) {
  try {
    // Mengambil Data (Pull Data)
    const pullData = await axios.get(
      `${conf.baseURL}/kartu-pasien/dokter/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(`
            SELECT Top 0 * INTO "#tmpDokter" FROM "tblDokter";
            INSERT INTO "#tmpDokter"
                        ("IDDokter", "NamaDokter", "Status", "Exported" , "TglAuto" ) VALUES ${pullData.data.data};
            MERGE tblDokter AS Target
            USING (SELECT * FROM #tmpDokter) AS Source
                ON (Target.IDDokter = Source.IDDokter)
                WHEN MATCHED THEN
                    UPDATE SET Target.NamaDokter = Source.NamaDokter, 
                              Target.Status = Source.Status,
                              Target.Exported = Source.Exported, 
                              Target.TglAuto = Source.TglAuto
                WHEN NOT MATCHED BY TARGET THEN
                          INSERT (IDDokter,NamaDokter,Status,Exported,TglAuto)
                          VALUES (Source.IDDokter, Source.NamaDokter, Source.Status,
                          Source.Exported,Source.TglAuto);
          `);

      // Menandai agar tidak di push kembali
      await sqlkp.execute(`
          SELECT Top 0 * INTO "#tmpDokter" FROM "tblDokter";
          INSERT INTO "#tmpDokter"
                      ("IDDokter", "NamaDokter", "Status", "Exported" , "TglAuto") VALUES ${pullData.data.data};
          MERGE flagDokter AS Target
          USING (SELECT * FROM #tmpDokter) AS Source
              ON (Target.flagIDDokter = Source.IDDokter)
              WHEN MATCHED THEN
                   UPDATE SET Target.flagPush = 1;`);

      // Memberikan flag di row server kalau sudah di pull data tsb

      const pullFlag = await axios.post(
        `${conf.baseURL}/kartu-pasien/dokter/pull/${conf.kodeCabang}`,
        { data: pullData.data.data }
      );

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Pull Data",
        data: pullData.data.data,
      });
    } else {
      res.status(204).json({
        success: true,
        status: 204,
        message: "Belum ada data",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

module.exports = router;
