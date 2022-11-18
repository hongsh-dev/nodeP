const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
var db;

MongoClient.connect(
  "mongodb+srv://shiv:123***@cluster0.dxo6tgm.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);
    db = client.db("todoapp");

    app.listen(443, function () {
      console.log("listening on 443");
    });
  }
);

app.get("/", function (req, res) {
  res.redirect("list")
});

app.get("/write", function (req, res) {
  res.render("write.ejs");
});

app.post("/add", function (req, res) {
  if (req.body.title == "") {
    console.log("타이틀 안적음");
    res.send("<script>alert('타이틀 적어'); history.back();</script>");
    return;
  }
  db.collection("counter").findOne(
    { name: "NumberOfPost" },
    function (err, result) {
      var incresedTotalPost = result.generatedPost + 1;
      console.log("발행됐던 갯수" + " " + incresedTotalPost);
      db.collection("post").insertOne(
        { _id: incresedTotalPost, title: req.body.title, date: req.body.date },
        function (err, result) {
          console.log("저장완료");
        }
      );

      db.collection("counter").updateOne(
        { name: "NumberOfPost" },
        { $set: { generatedPost: incresedTotalPost } },
        function (err, result) {
          if (err) return console.log(err);
        }
      );
    }
  );
  res.send("<script>alert('성공'); history.back();</script>");
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { posts: result });
    });
});

app.delete("/delete", function (req, res) {
  req.body._id = parseInt(req.body._id);
  console.log("삭제된 포스트 아이디 " + req.body._id);
  db.collection("post").deleteOne(req.body, function (error, result) {
    console.log("삭제완료");
  });
  res.status(200).send();
});

app.get("/detail/:postId", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.postId) },
    (error, result) => {
      res.render("detail.ejs", { data: result });
    }
  );
});

app.get("/edit/:postId", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.postId) },
    (error, result) => {
      res.render("edit.ejs", { posts: result });    
    }
  );
  
});

app.put("/edit", (req, res)=>{
  db.collection("post").updateOne(
  { _id: parseInt(req.body.id)}, 
  { $set: {title : req.body.title, date : req.body.date}},(error, result)=>{
    console.log("수정완료 번호: "+req.body.id);
    res.redirect("/list");
  })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res)=>{
  res.render("login.ejs");
});

app.post("/login", passport.authenticate('local', {failureRedirect : '/fail'}),(req, res)=>{
  res.redirect("/list");
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (usernameField, passwordField, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: usernameField }, function (error, result) {
    if (error) return done(error)

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
    if (passwordField == result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
  done(null, {})
});