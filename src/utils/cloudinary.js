const cloudinary = require('../config/cloudinaryConfig');

// Function to upload an image to a specific folder and get the URL
async function uploadImage(ImagePath, FolderPath) {
    try {
        const result = await cloudinary.uploader.upload(ImagePath, {
            folder: FolderPath, // Replace with your desired folder name
        });

        const imageUrl = result.secure_url;

        return imageUrl; // Return the URL if needed
    } catch (error) {
        console.error("Error uploading image:", error);
    }
}

async function uploadVideo(videoPath, folderPath) {
    try {
        // Validate that the file is a video file based on its mimetype
        if (!isValidVideoFile(videoPath)) {
            throw new Error('Invalid video file');
        }

        // Upload the video file to Cloudinary
        const result = await cloudinary.uploader.upload(videoPath, {
            folder: folderPath, // Replace with your desired folder name
            resource_type: 'video', // Specify the resource type as video
        });

        const videoUrl = result.secure_url;

        return videoUrl; // Return the URL if needed
    } catch (error) {
        console.error("Error uploading video:", error);
        throw error; // Re-throw the error to propagate it upwards
    }
}

async function uploadAudio(audioPath, folderPath) {
    try {
        // Validate that the file is an audio file based on its mimetype
        if (!isValidAudioFile(audioPath)) {
            throw new Error('Invalid audio file');
        }

        // Upload the audio file to Cloudinary
        const result = await cloudinary.uploader.upload(audioPath, {
            folder: folderPath, // Replace with your desired folder name
            resource_type: 'auto', // Let Cloudinary automatically determine the resource type
        });

        const audioUrl = result.secure_url;

        return audioUrl; // Return the URL if needed
    } catch (error) {
        console.error("Error uploading audio:", error);
        throw error; // Re-throw the error to propagate it upwards
    }
}

async function uploadFile(filePath, folderPath) {
    try {
        // Upload the file to Cloudinary without specifying the resource type
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folderPath, // Replace with your desired folder name
            resource_type: 'auto', // Let Cloudinary automatically determine the resource type
        });

        const fileUrl = result.secure_url;

        return fileUrl; // Return the URL if needed
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Re-throw the error to propagate it upwards
    }
}

// Function to validate if the file is an audio file based on its mimetype
function isValidAudioFile(audioPath) {
    // Define valid audio mimetypes
    const validAudioMimetypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        // Add more valid audio mimetypes as needed
    ];

    // Get the mimetype of the file
    const mimetype = getAudioMimetype(audioPath);

    // Check if the file mimetype is in the list of valid audio mimetypes
    return validAudioMimetypes.includes(mimetype);
}

// Function to get the mimetype of a file based on its extension
function getAudioMimetype(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
        case 'mp3':
            return 'audio/mpeg';
        case 'wav':
            return 'audio/wav';
        case 'ogg':
            return 'audio/ogg';
        // Add more cases for other audio file extensions
        default:
            return null;
    }
}

// Function to validate if the file is a video file based on its mimetype
function isValidVideoFile(videoPath) {
    // Define valid video mimetypes
    const validVideoMimetypes = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        // Add more valid video mimetypes as needed
    ];

    // Get the mimetype of the file
    const mimetype = getVideoMimetype(videoPath);

    // Check if the file mimetype is in the list of valid video mimetypes
    return validVideoMimetypes.includes(mimetype);
}

// Function to get the mimetype of a file based on its extension
function getVideoMimetype(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
        case 'mp4':
            return 'video/mp4';
        case 'mov':
            return 'video/quicktime';
        case 'avi':
            return 'video/x-msvideo';
        // Add more cases for other video file extensions
        default:
            return null;
    }
}

module.exports = {uploadImage, uploadVideo, uploadAudio, uploadFile};

