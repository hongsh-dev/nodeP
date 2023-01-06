var router = require("express").Router();

router.get("/", function(req, res) {
  res.redirect("list");
});

router.get("/write", function(req, res) {
  res.render("write.ejs");
});

router.get("/list", function(req, res) {
  req.app.db.collection("post").find().toArray(function(err, result) {
    res.render("list.ejs", { posts: result });
  });
});

/*일반적인 방법
router.get("/search", (req, res) => {
  req.app.db
    .collection("post")
    .find({ title: req.query.value }).toArray((err, result)=>{
      res.render("search.ejs", { posts: result });
    });
});
*/

/*인덱싱 사용하는 방법(미리 정렬해주어서 바이너리서치 하는 방법)
  이닦기 글쓰기 검색하면 이닦기 or 글쓰기
  이닦기 -글쓰기 검색하면 이닦기 중 글쓰기 제외 검색
  "이닦기 글쓰기" 검색하면 정확히 이닦기 글쓰기 검색
  그러나 글쓰기입니다~ 이런 글은 검색해 주지 않음
  router.get("/search", (req, res) => {
  req.app.db
    .collection("post")
    .find({ $text:{$search : req.query.value} }).toArray((err, result)=>{
      res.render("search.ejs", { posts: result });
    });
});
*/

/**
 * MongoDB안에 Search Index이용
 */
router.get("/search", (req, res) => {
  var searchReq = [
    {
      $search: {
        index: "titleIndex",
        text: {
          query: req.query.value,
          path: "title" //제목날짜 둘 다 찾고 싶으면 ['title', 'date']
        }
      }
    }
  ];
  console.log(req.query);
  req.app.db.collection("post").aggregate(searchReq).toArray((err, result) => {
    console.log(result);
    res.render("search.ejs", { posts: result });
  });
});

router.get("/upload", (req, res) => {
  res.render("upload.ejs");
});

router.post("/add", function(req, res) {
  if (req.body.title == "") {
    console.log("타이틀 안적음");
    res.send("<script>alert('타이틀 적어'); history.back();</script>");
    return;
  }
  req.app.db
    .collection("counter")
    .findOne({ name: "NumberOfPost" }, function(err, result) {
      var incresedTotalPost = result.generatedPost + 1;
      console.log("발행됐던 갯수" + " " + incresedTotalPost);
      req.app.db.collection("post").insertOne({
        _id: incresedTotalPost,
        title: req.body.title,
        date: req.body.date
      }, function(err, result) {
        console.log("저장완료");
      });

      req.app.db
        .collection("counter")
        .updateOne(
          { name: "NumberOfPost" },
          { $set: { generatedPost: incresedTotalPost } },
          function(err, result) {
            if (err) return console.log(err);
          }
        );
    });
  res.send("<script>alert('성공'); history.back();</script>");
});

router.delete("/delete", function(req, res) {
  req.body._id = parseInt(req.body._id);
  console.log("삭제된 포스트 아이디 " + req.body._id);
  req.app.db.collection("post").deleteOne(req.body, function(error, result) {
    console.log("삭제완료");
  });
  res.status(200).send();
});

router.get("/detail/:postId", (req, res) => {
  req.app.db
    .collection("post")
    .findOne({ _id: parseInt(req.params.postId) }, (error, result) => {
      res.render("detail.ejs", { data: result });
    });
});

router.get("/edit/:postId", (req, res) => {
  req.app.db
    .collection("post")
    .findOne({ _id: parseInt(req.params.postId) }, (error, result) => {
      res.render("edit.ejs", { posts: result });
    });
});

router.put("/edit", (req, res) => {
  req.app.db
    .collection("post")
    .updateOne(
      { _id: parseInt(req.body.id) },
      { $set: { title: req.body.title, date: req.body.date } },
      (error, result) => {
        console.log("수정완료 번호: " + req.body.id);
        res.redirect("/list");
      }
    );
});

module.exports = router;
