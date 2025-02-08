const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    fileTitle: {
        type: String,
        required: true,
        default: "Untitled"
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;