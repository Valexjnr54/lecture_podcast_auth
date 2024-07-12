const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const contentCredentials = upload.fields([
  { name: "videos", maxCount: 10 },
  { name: "audios", maxCount: 10 },
  { name: "documents", maxCount: 10 },
  { name: "thumbnails", maxCount: 10 },
]);

module.exports = { contentCredentials };
