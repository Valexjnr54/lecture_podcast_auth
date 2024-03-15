const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/'); // Set the destination folder for uploads
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname); // Set the filename
    },
});

const upload = multer({ storage: storage });

module.exports = {
    upload
};
