const express = require('express');

const {
    addStudent,
    getStudentInfo,
    updateStudentInfo,
    deleteStudent,
    removeStudentFromClass,
    getAllStudents,
    searchStudents,
} = require('../controllers/studentController');

const router = express.Router();

router.post('/', addStudent);
router.get('/search', searchStudents);
router.get('/:id', getStudentInfo);
router.get('/', getAllStudents);
router.put('/:id', updateStudentInfo);
router.delete('/:id', deleteStudent);
router.delete('/:classId/:studentId', removeStudentFromClass);

module.exports = router;