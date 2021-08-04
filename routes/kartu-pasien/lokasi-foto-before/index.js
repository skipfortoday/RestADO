const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();
const conf = require("../../../config/main");
const fire = require("../../../config/firebase");

// Listen apakah Ada Brodcast
fire
  .database()
  .ref("/kartu-pasien/tblPerawatanLokasiFotoBefore")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblPerawatanLokasiFotoBefore : ", data);
    axios
      .get(`${conf.appURL}/kartu-pasien/lokasi-foto-before`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

fire
  .database()
  .ref("/kartu-pasien/tblPerawatanLokasiFotoBefore")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblPerawatanLokasiFotoBefore: ", data);
    axios
      .patch(`${conf.appURL}/kartu-pasien/lokasi-foto-before`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

// Pengecekan apakah ada data baru
setInterval(function () {
  axios
    .post(`${conf.appURL}/kartu-pasien/lokasi-foto-before`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

setInterval(function () {
  axios
    .put(`${conf.appURL}/kartu-pasien/lokasi-foto-before`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.post("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblPerawatanLokasiFotoBefore JOIN flagPerawatanLokasiFotoBefore ON tblPerawatanLokasiFotoBefore.NoAuto = flagPerawatanLokasiFotoBefore.flagNoAuto WHERE flagPerawatanLokasiFotoBefore.flagPush = 0 ;
            `);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
          '${items.NoAuto}',
          ${
            items.NoAutoPerawatan == null ? null : `'${items.NoAutoPerawatan}'`
          },
          ${
            items.Keterangan == null
              ? null
              : `'${items.Keterangan.replace("'", "''")}'`
          },
          ${
            items.UserEntry == null
              ? null
              : `'${items.UserEntry.replace("'", "''")}'`
          },
          ${
            items.LoginComp == null
              ? null
              : `'${items.LoginComp.replace("\x00", "")}'`
          },
          ${
            items.CompName == null
              ? null
              : `'${items.CompName.replace("\x00", "")}'`
          },
          ${
            items.TglActivitas == null
              ? null
              : `'${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${
            items.JamActivitas == null
              ? null
              : `'${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${
            items.LokasiFotoBefore == null
              ? null
              : `'${items.LokasiFotoBefore.replace("'", "''")}'`
          },
          '${moment(items.TglAuto).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();
      // Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        `${conf.baseURL}/kartu-pasien/lokasi-foto-before/push/${conf.kodeCabang}`,
        { data: dataFinal }
      );

      // // Mendapatkan Waktu Data Terakhir Update
      // const getTimeAnchor = await axios.get(
      //   `${conf.baseURL}/api/kartu-pasien/lokasi-foto-before/waktu`
      // );

      // // Update Waktu Acuan ke DB Client
      // const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
      //       "time" = '${getTimeAnchor.data.data}'
      //       WHERE tablekey='tblFotoBefore';`);

      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpPerawatanLokasiFotoBefore" FROM "tblPerawatanLokasiFotoBefore";
      INSERT INTO "#tmpPerawatanLokasiFotoBefore"
      ("NoAuto", "NoAutoPerawatan", "Keterangan", "UserEntry", "LoginComp", "CompName", "TglActivitas", "JamActivitas", "LokasiFotoBefore", "TglAuto") VALUES ${dataFinal};
      MERGE flagPerawatanLokasiFotoBefore AS Target
      USING (SELECT * FROM #tmpPerawatanLokasiFotoBefore) AS Source
          ON (Target.flagNoAuto = Source.NoAuto)
          WHEN MATCHED THEN
               UPDATE SET Target.flagPush = 1;`);

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
      `${conf.baseURL}/kartu-pasien/lokasi-foto-before/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(`
            SELECT Top 0 * INTO "#tmpPerawatanLokasiFotoBefore" FROM "tblPerawatanLokasiFotoBefore";
            INSERT INTO "#tmpPerawatanLokasiFotoBefore"
            ("NoAuto", "NoAutoPerawatan", "Keterangan", "UserEntry", "LoginComp", "CompName", "TglActivitas", "JamActivitas", "LokasiFotoBefore", "TglAuto") VALUES ${pullData.data.data};
            MERGE tblPerawatanLokasiFotoBefore AS Target
            USING (SELECT * FROM #tmpPerawatanLokasiFotoBefore) AS Source
                ON (Target.NoAuto = Source.NoAuto)
                WHEN MATCHED THEN
                      UPDATE SET
                              Target.NoAuto = Source.NoAuto,
                              Target.NoAutoPerawatan = Source.NoAutoPerawatan,
                              Target.Keterangan = Source.Keterangan, 
                              Target.UserEntry = Source.UserEntry,
                              Target.LoginComp = Source.LoginComp,
                              Target.CompName = Source.CompName,
                              Target.TglActivitas = Source.TglActivitas,
                              Target.JamActivitas = Source.JamActivitas,
                              Target.LokasiFotoBefore = Source.LokasiFotoBefore,
                              Target.TglAuto = Source.TglAuto
                  WHEN NOT MATCHED BY TARGET THEN
                       INSERT
                       ("NoAuto", "NoAutoPerawatan", "Keterangan", "UserEntry", "LoginComp", "CompName", "TglActivitas", "JamActivitas", "LokasiFotoBefore", "TglAuto")
                        VALUES  (Source.NoAuto, Source.NoAutoPerawatan, Source.Keterangan, Source.UserEntry, Source.LoginComp, Source.CompName, Source.TglActivitas, Source.JamActivitas, Source.LokasiFotoBefore, Source.TglAuto);
          `);

      // Menandai agar tidak di push kembali
      await sqlkp.execute(`
          SELECT Top 0 * INTO "#tmpPerawatanLokasiFotoBefore" FROM "tblPerawatanLokasiFotoBefore";
          INSERT INTO "#tmpPerawatanLokasiFotoBefore"
          ("NoAuto", "NoAutoPerawatan", "Keterangan", "UserEntry", "LoginComp", "CompName", "TglActivitas", "JamActivitas", "LokasiFotoBefore", "TglAuto") VALUES ${pullData.data.data};
          MERGE flagPerawatanLokasiFotoBefore AS Target
          USING (SELECT * FROM #tmpPerawatanLokasiFotoBefore) AS Source
              ON (Target.flagNoAuto = Source.NoAuto)
              WHEN MATCHED THEN
                   UPDATE SET Target.flagPush = 1;`);

      // Memberikan flag di row server kalau sudah di pull data tsb

      const pullFlag = await axios.post(
        `${conf.baseURL}/kartu-pasien/lokasi-foto-before/pull/${conf.kodeCabang}`,
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
// Push Data Ke Server
router.put("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 1 flagNoAuto FROM flagPerawatanLokasiFotoBefore WHERE flagDelete = 1;`);
    if (checkData[0]) {
      let key = checkData[0].flagNoAuto;
      const pushData = await axios.put(
        `${conf.baseURL}/kartu-pasien/lokasi-foto-before/push/${conf.kodeCabang}`,
        { data: key }
      );

      const deleteFlag = await sqlkp.execute(
        `DELETE FROM flagPerawatanLokasiFotoBefore WHERE flagNoAuto = '${key}'`
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
      `${conf.baseURL}/kartu-pasien/lokasi-foto-before/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(
        `DELETE FROM tblPerawatanLokasiFotoBefore WHERE NoAuto = '${pullData.data.data}';
         DELETE FROM flagPerawatanLokasiFotoBefore WHERE flagNoAuto = '${pullData.data.data}';`
      );

      const pullFlag = await axios.put(
        `${conf.baseURL}/kartu-pasien/lokasi-foto-before/pull/${conf.kodeCabang}`,
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
