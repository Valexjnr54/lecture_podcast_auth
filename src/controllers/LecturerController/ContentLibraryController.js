const { validationResult, body } = require('express-validator');
const createError = require('http-errors')
const { Request, Response } =  require('express')
const Lecturer = require('../../models/LecturerModel')
const ContentLibrary = require('../../models/contentLibrary')
const {uploadImage, uploadVideo, uploadAudio, uploadFile} = require('../../utils/cloudinary');
const { isDocumentFile } = require('../../services/verification')
const fs = require('fs');

async function createVideoContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId
    try {
        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Titlt is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer){
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
        }

        if (!request.files || !('video' in request.files)) {
            return response.status(400).json({ status: 400, message: 'Please provide a video File.' });
        }
        const videoFile = request.files.video;
        if (typeof videoFile.mimetype === 'string' && !videoFile.mimetype.startsWith('video/')) {
            return response.status(400).json({ status: 400, message: 'Please provide a valid video file.' });
        }
        let content_url
        try {
            const contentUrl = await uploadVideo(videoFile[0].path, 'lecture_podcast/videos/content_library_videos');
            console.log("Video uploaded successfully:", content_url);
        
            // Delete the video file after successful upload
            fs.unlink(videoFile[0].path, (err) => {
                if (err) {
                    console.error(`Error deleting Content Video file`);
                } else {
                    console.log(`Content Video File deleted`);
                }
            });
            content_url = contentUrl
        } catch (error) {
            console.error("Error uploading video:", error);
            return response.status(400).json({ error: 'Error uploading video', status: 400, message: `${error}` });
        }
        
        let thumbnail = null;
        
        if (request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
        
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }
        
        // Create a new instance of the ContentModel
        const content = new ContentLibrary({
            lecturer_id,
            course_title,
            course_code, // This can be null if not provided in the request
            content_url,
            content_type: 'Video',
            content_category,
            thumbnail, // This can be null if not provided in the request
        });
        
        await content.save();
        return response.status(201).json({ status: 201, message: 'Content added successfully', data:content });
        

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function createAudioContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId
    try {

        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Titlt is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer)
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
    
            if (!request.files || !('audio' in request.files)) {
                return response.status(400).json({ status: 400, message: 'Please provide an audio File.' });
            }
            const audioFile = request.files.audio;
            let content_url;
            try{
                const contentUrl = await uploadAudio(audioFile[0].path, 'lecture_podcast/audio/content_library_audios');
                    fs.unlink(audioFile[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Content Audio file`);
                    } else {
                        console.log(`Content Audio File deleted`);
                    }
                });
                content_url = contentUrl
            }catch(error){
                console.error("Error uploading audio:", error);
                return response.status(400).json({ error: 'Error uploading audio', status: 400, message: `${error}` });
            }

            let thumbnail = null;
            if (request.files.thumbnail) {
                try {
                    thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                    console.log("Thumbnail uploaded successfully:", thumbnail);
            
                    // Delete the thumbnail file after successful upload
                    fs.unlink(request.files.thumbnail[0].path, (err) => {
                        if (err) {
                            console.error(`Error deleting Thumbnail Image file`);
                        } else {
                            console.log(`Thumbnail Image File deleted`);
                        }
                    });
                } catch (error) {
                    console.error("Error uploading thumbnail:", error);
                    return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
                }
            }
    
    
            // Create a new instance of the ContentModel
            const content = new ContentLibrary({
                lecturer_id,
                course_title,
                course_code, // This can be null if not provided in the request
                content_url,
                content_type: 'Audio',
                content_category,
                thumbnail, // This can be null if not provided in the request
            });
    
            await content.save();
            return response.status(201).json({ status: 201, message: 'Content added successfully', data:content });
    

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function createFileContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId
    try {

        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Titlt is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer)
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
        
        if (!request.files || !('document' in request.files)) {
            return response.status(400).json({ status: 400, message: 'Please provide a document file.' });
        }
        
        const uploadedFile = request.files.document;
        
        // Check if the mimetype of the uploaded file represents a document file type
        const isDocument = await isDocumentFile(uploadedFile[0].mimetype);
        if (!isDocument) {
            return response.status(400).json({ status: 400, message: 'Please provide a valid document file.' });
        }

        const content_url = await uploadFile(request.files['document'][0].path, 'lecture_podcast/documents/content_library_documents');
            fs.unlink(request.files['document'][0].path, (err) => {
            if (err) {
                console.error(`Error deleting Content Document file`);
            } else {
                console.log(`Content Document File deleted`);
            }
        });
    
            let thumbnail = null;
        
            if (request.files.thumbnail) {
                try {
                    thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                    console.log("Thumbnail uploaded successfully:", thumbnail);
            
                    // Delete the thumbnail file after successful upload
                    fs.unlink(request.files.thumbnail[0].path, (err) => {
                        if (err) {
                            console.error(`Error deleting Thumbnail Image file`);
                        } else {
                            console.log(`Thumbnail Image File deleted`);
                        }
                    });
                } catch (error) {
                    console.error("Error uploading thumbnail:", error);
                    return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
                }
            }

            // Create a new instance of the ContentModel
            const content = new ContentLibrary({
                lecturer_id,
                course_title,
                course_code, // This can be null if not provided in the request
                content_url,
                content_type: 'File',
                content_category,
                thumbnail, // This can be null if not provided in the request
            });
    
            await content.save();
            return response.status(201).json({ status: 201, message: 'Content added successfully', data:content });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function createContent(request, response) {
    const { course_title, course_code, content_category, content } = request.body;
    const lecturer_id = request.user.lecturerId
    try {

        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Title is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
            body('content').notEmpty().withMessage('Content is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer)
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
    
        let thumbnail = null;
        
        if (request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
        
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }

        const content_url = request.body.content

        // Create a new instance of the ContentModel
        const content = new ContentLibrary({
            lecturer_id,
            course_title,
            course_code, // This can be null if not provided in the request
            content_url,
            content_type: 'Presentation',
            content_category,
            thumbnail, // This can be null if not provided in the request
        });

        await content.save();
        return response.status(201).json({ status: 201, message: 'Content added successfully', data:content });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function allContent(request, response){
    const lecturer_id = request.user.lecturerId
    try{
        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer)
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
        const contents = await ContentLibrary.find({ lecturer_id })
        if(!contents)
            return response.status(404).json({ status: 404, message: "Lecturer has no content yet"})
        return response.status(200).json({ status: 200, message: 'Contents Fetch successfully', data:contents });
    }catch(error){
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function singleContent(request, response){
    const lecturer_id = request.user.lecturerId
    const _id = request.query.id
    try{
        const lecturer = await Lecturer.findOne({ _id: lecturer_id})
        if(!lecturer)
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"})
        const content = await ContentLibrary.findById({ _id })
        if(!content)
            return response.status(404).json({ status: 404, message: "Content Not Found"}).NotFound(`Content Not Found`)
        return response.status(200).json({ status: 200, message: 'Content Fetched successfully', data:content });
    }catch(error){
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function updateVideoContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId;
    const _id = request.query.id;

    try {
        // Validation rules
        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Title is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id });
        if (!lecturer) {
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"});
        }

        const check_owner = await ContentLibrary.findOne({ _id, lecturer_id });
        if (!check_owner) {
            return response.status(404).json({ status: 404, message: "Content does not belong to this lecturer"});
        }

        let content_url = null;
        if (request.files && request.files.video) {
            const videoFile = request.files.video;
            try {
                content_url = await uploadVideo(videoFile[0].path, 'lecture_podcast/videos/content_library_videos');
                console.log("Video uploaded successfully:", content_url);
                // Delete the video file after successful upload
                fs.unlink(videoFile[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Content Video file`);
                    } else {
                        console.log(`Content Video File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading video:", error);
                return response.status(400).json({ error: 'Error uploading video', status: 400, message: `${error}` });
            }
        }

        let thumbnail = null;
        if (request.files && request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }

        // Define the update object with only the fields that have changed
        let updateObject = {
            course_title,
            course_code, // This can be null if not provided in the request
            content_category,
        };

        // Check if thumbnail and content_url are provided in the request, if not, retain their current values
        if (thumbnail !== null) {
            updateObject.thumbnail = thumbnail;
        }

        if (content_url !== null) {
            updateObject.content_url = content_url;
        }

        // Perform the update operation
        const updatedContent = await ContentLibrary.findOneAndUpdate(
            { _id }, // Filter criteria to find the document to update
            updateObject, // Update object with conditional fields
            { new: true } // To return the updated document
        );
        return response.status(200).json({ status: 200, message: 'Content updated successfully', data: updatedContent });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function updateAudioContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId;
    const _id = request.query.id;

    try {
        // Validation rules
        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Title is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id });
        if (!lecturer) {
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"});
        }

        const check_owner = await ContentLibrary.findOne({ _id, lecturer_id });
        if (!check_owner) {
            return response.status(404).json({ status: 404, message: "Content does not belong to this lecturer"});
        }

        let content_url = null;
        if (request.files && request.files.audio) {
            const audioFile = request.files.audio;
            try {
                content_url = await uploadAudio(audioFile[0].path, 'lecture_podcast/audio/content_library_audios');
                console.log("Audio uploaded successfully:", content_url);
                // Delete the audio file after successful upload
                fs.unlink(audioFile[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Content Audio file`);
                    } else {
                        console.log(`Content Audio File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading audio:", error);
                return response.status(400).json({ error: 'Error uploading audio', status: 400, message: `${error}` });
            }
        }

        let thumbnail = null;
        if (request.files && request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }

        // Define the update object with only the fields that have changed
        let updateObject = {
            course_title,
            course_code, // This can be null if not provided in the request
            content_type: 'Audio',
            content_category,
        };

        // Check if thumbnail and content_url are provided in the request, if not, retain their current values
        if (thumbnail !== null) {
            updateObject.thumbnail = thumbnail;
        }

        if (content_url !== null) {
            updateObject.content_url = content_url;
        }

        // Perform the update operation
        const updatedContent = await ContentLibrary.findOneAndUpdate(
            { _id }, // Filter criteria to find the document to update
            updateObject, // Update object with conditional fields
            { new: true } // To return the updated document
        );
        return response.status(200).json({ status: 200, message: 'Content updated successfully', data: updatedContent });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function updateFileContent(request, response) {
    const { course_title, course_code, content_category } = request.body;
    const lecturer_id = request.user.lecturerId;
    const _id = request.query.id;

    try {
        // Validation rules
        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Title is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id });
        if (!lecturer) {
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"});
        }

        const check_owner = await ContentLibrary.findOne({ _id, lecturer_id });
        if (!check_owner) {
            return response.status(404).json({ status: 404, message: "Content does not belong to this lecturer"});
        }

        let content_url = null;
        if (request.files && request.files.document) {
            const uploadedFile = request.files.document;
            // Check if the mimetype of the uploaded file represents a document file type
            const isDocument = await isDocumentFile(uploadedFile[0].mimetype);
            if (!isDocument) {
                return response.status(400).json({ status: 400, message: 'Please provide a valid document file.' });
            }

            try {
                content_url = await uploadFile(uploadedFile[0].path, 'lecture_podcast/documents/content_library_documents');
                console.log("File uploaded successfully:", content_url);
                // Delete the file after successful upload
                fs.unlink(uploadedFile[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Content Document file`);
                    } else {
                        console.log(`Content Document File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading file:", error);
                return response.status(400).json({ error: 'Error uploading file', status: 400, message: `${error}` });
            }
        }

        let thumbnail = null;
        if (request.files && request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }

        // Define the update object with only the fields that have changed
        let updateObject = {
            course_title,
            course_code, // This can be null if not provided in the request
            content_type: 'File',
            content_category,
        };

        // Check if thumbnail and content_url are provided in the request, if not, retain their current values
        if (thumbnail !== null) {
            updateObject.thumbnail = thumbnail;
        }

        if (content_url !== null) {
            updateObject.content_url = content_url;
        }

        // Perform the update operation
        const updatedContent = await ContentLibrary.findOneAndUpdate(
            { _id }, // Filter criteria to find the document to update
            updateObject, // Update object with conditional fields
            { new: true } // To return the updated document
        );
        return response.status(200).json({ status: 200, message: 'Content updated successfully', data: updatedContent });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function updateContent(request, response) {
    const { course_title, course_code, content_category, content } = request.body;
    const lecturer_id = request.user.lecturerId;
    const _id = request.query.id;

    try {
        // Validation rules
        const validationRules = [
            body('course_title').notEmpty().withMessage('Course Title is required'),
            body('content_category').notEmpty().withMessage('Content Category is required'),
            body('content').notEmpty().withMessage('Content is required'),
        ];

        // Apply validation rules to the request
        await Promise.all(validationRules.map(rule => rule.run(request)));

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

        const lecturer = await Lecturer.findOne({ _id: lecturer_id });
        if (!lecturer) {
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"});
        }

        const check_owner = await ContentLibrary.findOne({ _id, lecturer_id });
        if (!check_owner) {
            return response.status(404).json({ status: 404, message: "Content does not belong to this lecturer"});
        }

        let thumbnail = null;
        if (request.files && request.files.thumbnail) {
            try {
                thumbnail = await uploadImage(request.files.thumbnail[0].path, 'lecture_podcast/thumbnails/content_library_thumbnails');
                console.log("Thumbnail uploaded successfully:", thumbnail);
                // Delete the thumbnail file after successful upload
                fs.unlink(request.files.thumbnail[0].path, (err) => {
                    if (err) {
                        console.error(`Error deleting Thumbnail Image file`);
                    } else {
                        console.log(`Thumbnail Image File deleted`);
                    }
                });
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return response.status(400).json({ error: 'Error uploading thumbnail', status: 400, message: `${error}` });
            }
        }

        // Define the update object with only the fields that have changed
        let updateObject = {
            lecturer_id,
            course_title,
            content_url: content, // Assuming content contains the URL
            course_code, // This can be null if not provided in the request
            content_type: 'Presentation',
            content_category,
        };

        // Check if thumbnail is provided in the request, if not, retain its current value
        if (thumbnail !== null) {
            updateObject.thumbnail = thumbnail;
        }

        // Perform the update operation
        const updatedContent = await ContentLibrary.findOneAndUpdate(
            { _id }, // Filter criteria to find the document to update
            updateObject, // Update object with conditional fields
            { new: true } // To return the updated document
        );
        return response.status(200).json({ status: 200, message: 'Content updated successfully', data: updatedContent });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

async function deleteContent(request, response) {
    const lecturer_id = request.user.lecturerId;
    const _id = request.query.id;

    try {
        const lecturer = await Lecturer.findOne({ _id: lecturer_id });
        if (!lecturer) {
            return response.status(404).json({ status: 404, message: "Lecturer Not Found"});
        }

        const check_owner = await ContentLibrary.findOne({ _id, lecturer_id });
        if (!check_owner) {
            return response.status(404).json({ status: 404, message: "Content does not belong to this lecturer"});
        }

        // Perform the update operation
        const deletedContent = await ContentLibrary.findOneAndDelete({ _id, lecturer_id });

        if (!deletedContent) {
            return response.status(404).json({ status: 404, message: 'Content not found' });
        }

        console.log("Content deleted successfully:", deletedContent);
        return response.status(200).json({ status: 200, message: 'Content deleted successfully', data: deletedContent });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}
module.exports = {
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
    deleteContent
};
