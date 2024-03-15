const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    lecturer_id: {
        type: String,
        required: true,
    },
    course_title: {
        type: String,
        required: true,
    },
    course_code: {
        type: String,
        default: null, // Making course_code nullable
    },
    content_url: {
        type: String,
        required: true,
    },
    content_type: {
        type: String,
        required: true,
        enum: ['Video', 'Audio', 'File', 'Presentation'],
    },
    content_category: {
        type: String,
        required: true,
        enum: ['lecture', 'assignment', 'quiz', 'discussion','science','art'],
    },
    thumbnail: {
        type: String,
        default: null, // Making thumbnail nullable
    },
    timestamp: {
        type: Date, // Using Date type for timestamp
        default: Date.now, // Setting default value to current timestamp
    }
});

const ContentLibrary = mongoose.model('content_library', ContentSchema);

module.exports = ContentLibrary;
