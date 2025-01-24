const express = require('express');

const {
    createClass, 
    createTestForClass,
    addStudentsToClass,
    getClasses,
    getClassById,
    addOrUpdateTestScores,
    updateClassInfo, 
    deleteClass,
    deleteTest,
} = require('../controllers/classController.js')

const router = express.Router();

router.post('/', createClass);
router.post('/tests', createTestForClass);
router.post('/students', addStudentsToClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.put('/tests/scores', addOrUpdateTestScores);
router.put('/:id', updateClassInfo);
router.delete('/:id', deleteClass);
router.delete('/:id/:testId', deleteTest);

module.exports = router;