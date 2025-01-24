const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {type: String, required: true },
    classId: {type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    attendance: {type: Number, default: 100 },
    notes: {type: String },
    yeargroup: {type: String, required: true},
});

module.exports = mongoose.model('Student', studentSchema);