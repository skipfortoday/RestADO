const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();
const conf = require("../../../config/main");
const fire = require("../../../config/firebase");

fire
  .database()
  .ref("/kartu-pasien/tblBA")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblBA : ", data);
    axios
      .get(`${conf.appURL}/kartu-pasien/ba`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

fire
  .database()
  .ref("/kartu-pasien/tblBA")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblBA : ", data);
    axios
      .patch(`${conf.appURL}/kartu-pasien/ba`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

setInterval(function () {
  axios
    .post(`${conf.appURL}/kartu-pasien/ba`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

setInterval(function () {
  axios
    .put(`${conf.appURL}/kartu-pasien/ba`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

// Push Data Ke Server
router.post("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblBA JOIN flagBA ON tblBA.IDBA = flagBA.flagIDBA WHERE flagBA.flagPush = 0;`);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
                  '${items.IDBA}',
                  ${
                    items.NamaBA == null
                      ? null
                      : `'${items.NamaBA.replace("'", "''")}'`
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
        `${conf.baseURL}/kartu-pasien/ba/push/${conf.kodeCabang}`,
        { data: dataFinal }
      );

      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpBA" FROM "tblBA";
      INSERT INTO "#tmpBA"
                  ("IDBA", "NamaBA", "Status", "Exported" , "TglAuto") VALUES ${dataFinal};
      MERGE flagBA AS Target
      USING (SELECT * FROM #tmpBA) AS Source
          ON (Target.flagIDBA = Source.IDBA)
          WHEN MATCHED THEN
               UPDATE SET Target.flagPush = 1;`);

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Push Data",
        data: dataFinal,
      });
    } else {
      res.status(204).json({
        success: false,
        status: 204,
        message: "Belum ada data untuk di Push",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

// Push Data Ke Server
router.put("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 1 flagIDBA FROM flagBA WHERE flagDelete = 1;`);

    if (checkData[0]) {
      let key = checkData[0].flagIDBA;
      const pushData = await axios.put(
        `${conf.baseURL}/kartu-pasien/ba/push/${conf.kodeCabang}`,
        { data: key }
      );

      const deleteFlag = await sqlkp.execute(
        `DELETE FROM flagBA WHERE flagIDBA = '${key}'`
      );

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Push Data",
        data: key,
      });
    } else {
      res.status(204).json({
        success: false,
        status: 204,
        message: "Belum ada data untuk di Push",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

// Pull Data Dari Server
router.patch("/", async function (req, res, next) {
  try {
    // Mengambil Data (Pull Data)
    const pullData = await axios.patch(
      `${conf.baseURL}/kartu-pasien/ba/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(
        `DELETE FROM tblBA WHERE IDBA = '${pullData.data.data}';
         DELETE FROM flagBA WHERE flagIDBA = '${pullData.data.data}';`
      );

      const pullFlag = await axios.put(
        `${conf.baseURL}/kartu-pasien/ba/pull/${conf.kodeCabang}`,
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
        status: 200,
        message: "Belum ada data",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

// Pull Data Dari Server
router.get("/", async function (req, res, next) {
  try {
    // Mengambil Data (Pull Data)
    const pullData = await axios.get(
      `${conf.baseURL}/kartu-pasien/ba/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(`
            SELECT Top 0 * INTO "#tmpBA" FROM "tblBA";
            INSERT INTO "#tmpBA"
                        ("IDBA", "NamaBA", "Status", "Exported" , "TglAuto" ) VALUES ${pullData.data.data};
            MERGE tblBA AS Target
            USING (SELECT * FROM #tmpBA) AS Source
                ON (Target.IDBA = Source.IDBA)
                WHEN MATCHED THEN
                    UPDATE SET Target.NamaBA = Source.NamaBA, 
                              Target.Status = Source.Status,
                              Target.Exported = Source.Exported, 
                              Target.TglAuto = Source.TglAuto
                WHEN NOT MATCHED BY TARGET THEN
                          INSERT (IDBA,NamaBA,Status,Exported,TglAuto)
                          VALUES (Source.IDBA, Source.NamaBA, Source.Status,
                          Source.Exported,Source.TglAuto);
          `);

      // Menandai agar tidak di push kembali
      await sqlkp.execute(`
          SELECT Top 0 * INTO "#tmpBA" FROM "tblBA";
          INSERT INTO "#tmpBA"
                      ("IDBA", "NamaBA", "Status", "Exported" , "TglAuto") VALUES ${pullData.data.data};
          MERGE flagBA AS Target
          USING (SELECT * FROM #tmpBA) AS Source
              ON (Target.flagIDBA = Source.IDBA)
              WHEN MATCHED THEN
                   UPDATE SET Target.flagPush = 1;`);

      // Memberikan flag di row server kalau sudah di pull data tsb

      const pullFlag = await axios.post(
        `${conf.baseURL}/kartu-pasien/ba/pull/${conf.kodeCabang}`,
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
        status: 200,
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
