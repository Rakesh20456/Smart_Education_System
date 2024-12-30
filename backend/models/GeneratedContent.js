const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);
module.exports = GeneratedContent;
