const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() } ,
    name: { type: String, required: true },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: {type: String},
    students: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],
    tests: [
        {
            _id: {type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            testName: {type: String, required: true},
            subject: {type: String, required: true},
            date: {type: Date, default: Date.now},
            results: [
                {
                    studentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Student'},
                    score: {type: Number, min: 0, max: 100},
                },
            ],
        },
    ],
});

module.exports = mongoose.model('Class', classSchema);