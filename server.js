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
app.use("/", require("./routes/upload.js"));
app.use("/", require("./routes/join.js"));

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

app.get("/join", (req, res) => {
  res.render("join.ejs");
});

app.post("/addJoin", function(req, res) {
  req.app.db
    .collection("counter")
    .findOne({ name: "NumberOfJoin" }, function(err, result) {
      var incresedTotalPost = result.generatedJoin + 1;
      console.log("만들었던 회원수" + " " + incresedTotalPost);
      req.app.db.collection("login").insertOne({
        _id: incresedTotalPost,
        id: req.body.id,
        pw: req.body.pw
      }, function(err, result) {
        console.log("채팅방 저장완료");
      });

      req.app.db
        .collection("counter")
        .updateOne(
          { name: "NumberOfJoin" },
          { $set: { generatedJoin: incresedTotalPost } },
          function(err, result) {
            if (err) return console.log(err);
          }
        );
    });
  res.write('<script>window.location="/list"</script>');
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
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


