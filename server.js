require("dotenv").config();
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
var db;

app.use("/", require("./routes/int.js"));
app.use("/", require("./routes/chat.js"));

MongoClient.connect(process.env.DB_URL, function(err, client) {
  if (err) return console.log(err);
  db = client.db("todoapp");
  app.db = db;
  app.listen(process.env.PORT, function() {
    console.log("listening on 443");
  });
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
app.passport = passport;
app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  (req, res) => {
    res.redirect("/list");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false
    },
    function(usernameField, passwordField, done) {
      //console.log(입력한아이디, 입력한비번);
      db
        .collection("login")
        .findOne({ id: usernameField }, function(error, result) {
          if (error) return done(error);

          if (!result) return done(null, false, { message: "존재하지않는 아이디요" });
          if (passwordField == result.pw) {
            return done(null, result);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(아이디, done) {
  done(null, {});
});

let multer = require("multer");
var path = require("path");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/image");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now());
  }
});
var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return cb(new Error("피엔지 제피지 온리 맨"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024
  }
});

app.post("/upload", upload.single("profile"), (req, res) => {
  res.write("<script>alert('success')</script>");
  res.write('<script>window.location="/list"</script>');
});
