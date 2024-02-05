const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("./config/db"); // Require the database configuration
const session = require("express-session");
const config = require("./config/config");
const nocache = require("nocache");
const cors = require("cors");

const adminRouter = require("./routes/admin");
const usersRouter = require("./routes/users");

const app = express();

app.use(nocache());
app.use(cors());

app.use(
  session({
    name: `daffyduck`,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 6000000, //
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout/layout"); // Default layout file

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error',{lay:false});
// });

app.listen(3000, () => {
  console.log("server is started at port 3000");
});
module.exports = app;
