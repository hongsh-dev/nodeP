var router = require('express').Router();

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
    fileSize: 3024 * 3024
  }
});

router.post("/upload", upload.single("profile"), (req, res) => {
  res.write("<script>alert('success')</script>");
  res.write('<script>window.location="/list"</script>');
});

module.exports = router;