const mongoose = require('mongoose');

const learningContentSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    level: {type: String, required: true},
    categoryData: {
        type: Map,
        of: Map,
        required: true
    }
});

const LearningModel = mongoose.model('LearningContent', learningContentSchema);
module.exports = LearningModel;