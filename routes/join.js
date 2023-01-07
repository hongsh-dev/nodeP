var router = require('express').Router();

router.get("/join", (req, res) => {
    res.render("join.ejs");
});

router.post("/addJoin", function (req, res) {

    //아이디 유효성 검사
    req.app.db.collection("login").findOne({ id: req.body.id }, (err, result) => {
        console.log(res);
        if (result === null) {
            console.log('아이디 사용가능');
            gogo();
        } else {
            console.log('중복된다');
            res.send("<script>alert('응 아이디 중복'); history.back();</script>");
        }
    });

    function gogo() {
        req.app.db
            .collection("counter")
            .findOne({ name: "NumberOfJoin" }, function (err, result) {
                var incresedTotalPost = result.generatedJoin + 1;
                console.log("새 회원 번호" + " " + incresedTotalPost);

                req.app.db.collection("login").insertOne({
                    _id: incresedTotalPost,
                    id: req.body.id,
                    pw: req.body.pw,
                    nn: req.body.nn
                }, function (err, result) {
                    console.log("회원 저장완료");
                });

                req.app.db
                    .collection("counter")
                    .updateOne(
                        { name: "NumberOfJoin" },
                        { $set: { generatedJoin: incresedTotalPost } },
                        function (err, result) {
                            if (err) return console.log(err);
                        }
                    );
            });
        res.send('<script>window.location="/list"</script>');
    };

});

module.exports = router;