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

const videoCredentials = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);

const audioCredentials = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);

const documentCredentials = upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);
const contentCredentials = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
]);

module.exports = {
    upload,
    videoCredentials,
    audioCredentials,
    documentCredentials,
    contentCredentials
};
