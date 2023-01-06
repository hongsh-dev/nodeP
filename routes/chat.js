var router = require("express").Router();

router.get("/chat", (req, res) => {
  res.render("chat.ejs");
});

module.exports = router;
