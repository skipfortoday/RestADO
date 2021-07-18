var createError = require("http-errors");
var express = require("express");
let cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var dataPasien = require("./routes/kartu-pasien/data-pasien");
var dokter = require("./routes/kartu-pasien/dokter");
var ba = require("./routes/kartu-pasien/ba");
var lokasiFotoBefore = require("./routes/kartu-pasien/lokasi-foto-before");
var lokasiFotoAfter = require("./routes/kartu-pasien/lokasi-foto-after");
var perawatan = require("./routes/kartu-pasien/perawatan");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/kartu-pasien/data-pasien", dataPasien);
app.use("/kartu-pasien/dokter", dokter);
app.use("/kartu-pasien/ba", ba);
app.use("/kartu-pasien/lokasi-foto-before", lokasiFotoBefore);
app.use("/kartu-pasien/lokasi-foto-after", lokasiFotoAfter);
app.use("/kartu-pasien/perawatan", perawatan);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
