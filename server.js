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

MongoClient.connect(process.env.DB_URL, function (err, client) {
  if (err) return console.log(err);
  db = client.db("todoapp");
  app.db = db;
  app.listen(process.env.PORT, function () {
    console.log("listening on 443");
  });
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
app.passport = passport;

//app.use는 미들웨어를 사용하겠다는 말인데,
//웹서버에서 요청과 응답 중간에 실행되는 코드
//적법한지 검사하는 기능들을 미들웨어에 담는다

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
  //비밀코드는 세션을 만들때 사용하는 비밀번호
);
app.use(passport.initialize());
app.use(passport.session());

//위에 있는 코드때문에 실행이 된다
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false, //다른 정보 검증
    },
    function (usernameField, passwordField, done) {
      db.collection("login").findOne({ id: usernameField }, function (
        error,
        result
      ) {
        if (error) return done(error);

        if (!result)
          return done(null, false, { message: "존재하지않는 아이디요" });
        //done(서버에러(db에러), 성공시 사용자 db데이터, 에러메세지)
        if (passwordField == result.pw) {
          //암호화를 해서 비교를 해야하는데 그러지 않음
          return done(null, result);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

//세션을 저장시키는 코드, 로그인 성공시 발동
//비밀번호 검증을 하고 난 뒤에 result가 user로 매핑이 된다
//아이디를 이용해서 세션을 쿠키에 저장시킨다

passport.serializeUser(function (user, done) {
  console.log(user.id + " 세션이 만들어짐");
  done(null, user.id);
});

//세션 데이터를 가진 사람을 DB에서 찾을 때 사용
passport.deserializeUser(function (아이디, done) {
  done(null, {});
});

function youLogined(req, res, next) {
  //로그인하고 세션이 있으면 req.user 역시 항상 있다
  if (req.user) {
    next(); //유저가 맞는지 확인하고 통과
  } else {
    res.send("로그인 안하셨는데요?asdasd");
  }
}

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/join", (req, res) => {
  res.render("join.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }), //로컬 방식으로 회원인증을 한다
  (req, res) => {
    res.redirect("/list");
  }
);

//youLogined는 미들웨어라고 한다
app.get("/mypages", youLogined, (req, res) => {
  //이렇게 출력해봤자 아무것도 안나온다, deserializeUser 이용해야 한다
  console.log(req.user);
  res.render("mypage.ejs");
});
