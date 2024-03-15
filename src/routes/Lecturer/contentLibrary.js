const express = require('express')
const { authenticateJWT } = require('../../middlewares/authMiddleware/authenticationMiddleware')
const { videoCredentials, audioCredentials, documentCredentials, contentCredentials } = require('../../middlewares/multerProfileMiddleware')
const { 
    createVideoContent, 
    createAudioContent, 
    createFileContent, 
    createContent, 
    allContent, 
    singleContent,
    updateVideoContent,
    updateAudioContent,
    updateFileContent,
    updateContent,
    deleteContent,
} = require('../../controllers/LecturerController/ContentLibraryController')
const contentRouter = express.Router()

contentRouter.post('/upload-video-content', authenticateJWT, videoCredentials, createVideoContent);
contentRouter.post('/upload-audio-content', authenticateJWT, audioCredentials, createAudioContent);
contentRouter.post('/upload-file-content', authenticateJWT, documentCredentials, createFileContent);
contentRouter.post('/create-content', authenticateJWT, contentCredentials, createContent);
contentRouter.get('/all-content', authenticateJWT, allContent);
contentRouter.get('/single-content', authenticateJWT, singleContent);
contentRouter.put('/update-video-content', authenticateJWT, videoCredentials, updateVideoContent);
contentRouter.put('/update-audio-content', authenticateJWT, audioCredentials, updateAudioContent);
contentRouter.put('/update-file-content', authenticateJWT, documentCredentials, updateFileContent);
contentRouter.put('/update-content', authenticateJWT, contentCredentials, updateContent);
contentRouter.delete('/delete-content', authenticateJWT, deleteContent);

module.exports = contentRouter