const Student = require('../models/student');
const Class = require('../models/class');
const mongoose = require('mongoose');
const studentService = require('../services/studentServices');

const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters for regex
};

const addStudent = async(req, res) => {
    const {name, attendance, notes, yeargroup} = req.body;

    try {
        const newStudent = await studentService.addStudent(name, attendance, notes, yeargroup);
        res.status(201).json({message: 'student added successfully', student: newStudent})
    } catch(err) {
        res.status(500).json({message:'error adding student', error: err.message});
    }
};

const getStudentInfo = async(req,res) => {
    const {id} = req.params;

    try {
        const student = await studentService.getStudentInfo(id);
        res.status(200).json({message: 'student info retrieved successfully', student,});
    } catch (err) {
        res.status(500).json({message: 'error retrieving student info', error: err.message});
    }
};

const getAllStudents = async (req, res) => {
    try {
      const students = await Student.find({});
      res.status(200).json(students);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'Error fetching students', error: err.message });
    }
  };

  const searchStudents = async (req, res) => {
    console.log("searchStudents endpoint hit. q =", req.query.q); // Debugging
    try {
        const { q } = req.query;
        if (!q) {
            console.log("No query parameter provided."); // Debugging
            return res.json([]);
        }

        // Escape special characters in the query string
        const regex = new RegExp(escapeRegex(q), 'i'); // 'i' makes the search case-insensitive
        console.log("Regex generated for search:", regex); // Debugging

        // Perform the search
        const students = await Student.find({ name: regex });
        console.log("Students found:", students); // Debugging
        res.json(students);
    } catch (err) {
        console.error("Error searching students:", err); // Debugging
        res.status(500).json({ message: 'Error searching students', error: err.message });
    }
};

  

const updateStudentInfo = async (req,res) => {
    const {id} = req.params;
    const updates = req.body;

    try {
        const updatedStudent = await studentService.updateStudentInfoService(id, updates);

        res.status(200).json({
            message: 'student info updated successfully',
            student: updatedStudent,
        });
    } catch(err) {
        console.error('Error updating student:', err.message);
        res.status(500).json({
            message: 'error updating student information',
            error: err.message
        });
    }
};

const removeStudentFromClass = async(req,res) => {
    const {studentId, classId,} = req.params;

    try {
        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({message: 'Class not found'});
        }

        classData.students = classData.students.filter(
            (id) => id.toString() !== studentId
        );

        await classData.save();

        res.status(200).json({message: 'student removed from class successfully'});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'error removing student from class', error: err.message});
    }
};

const deleteStudent = async(req,res) =>  {
    const {id} = req.params;

    try {

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const student = await Student.findByIdAndDelete(id);
        if(!student) {
            return res.status(404).json({message: 'student not found'});
        }

        const result = await Class.updateMany(
            { students: id },
            { $pull: { students: id } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Student removed from ${result.modifiedCount} class(es)`);
        }

        res.status(200).json({ message: 'Student deleted and removed from classes successfully' });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error deleting student', error: err.message});
    }
};


module.exports = {addStudent, getStudentInfo, getAllStudents, searchStudents, updateStudentInfo, deleteStudent, removeStudentFromClass};