var router = require("express").Router();

function youLogined(req, res, next) {
  //로그인하고 세션이 있으면 req.user 역시 항상 있다
  if (req.user) {
    next(); //유저가 맞는지 확인하고 통과
  } else {
    res.send("로그인 안하셨는데요?asdasd");
  }
}

router.get("/chat", youLogined, function (req, res) {
  req.app.db
    .collection("chattingbang")
    .find({ master_id: req.user._id })
    .toArray(function (err, result) {
      res.render("chat.ejs", { chattingbang: result });
    });
});

router.get("/detailChat/:chatId", (req, res) => {
  req.app.db
    .collection("chattingbang")
    .findOne({ _id: parseInt(req.params.chatId) }, (error, result) => {
      res.render("detailChat.ejs", { data: result });
      console.log("채팅방 " + result.name);
    });
});

router.get("/addChat", function (req, res) {
  console.log("addChat");
  res.render("addChat.ejs");
});

router.post("/addChatName", function (req, res) {
  req.app.db
    .collection("counter")
    .findOne({ name: "NumberOfBang" }, function (err, result) {
      var incresedTotalPost = result.generatedBang + 1;
      console.log("만들었던 채팅방 갯수" + " " + incresedTotalPost);
      req.app.db.collection("chattingbang").insertOne(
        {
          _id: incresedTotalPost,
          master_id: req.user._id,
          master: req.user.id,
          name: req.body.name1,
          lastChat: req.body.hi,
        },
        function (err, result) {
          console.log("채팅방 저장완료");
        }
      );

      req.app.db
        .collection("counter")
        .updateOne(
          { name: "NumberOfBang" },
          { $set: { generatedBang: incresedTotalPost } },
          function (err, result) {
            if (err) return console.log(err);
          }
        );
    });
  res.write('<script>window.location="/chat"</script>');
});

router.delete("/deleteChat", function (req, res) {
  req.body._id = parseInt(req.body._id);
  console.log("삭제된 채팅방 아이디 " + req.body._id);
  req.app.db
    .collection("chattingbang")
    .deleteOne(req.body, function (error, result) {
      console.log("채팅방 삭제완료");
    });
  res.status(200).send();
});

module.exports = router;
