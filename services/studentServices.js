const Student = require('../models/student');
const mongoose = require('mongoose');

const addStudent = async (name, attendance, notes, yeargroup) => {

    if(attendance !== undefined && (attendance < 0 || attendance > 100)) {
        throw new Error('Attendance must be between 0 and 100');
    };

    const existingStudent = await Student.findOne({name, yeargroup});  
    if(existingStudent) {
        throw new Error('A student with the same name and year group already exists')
    }

    const newStudent = new Student({name, attendance, notes, yeargroup});
    await newStudent.save();
    return newStudent;
};

//get student information via Id
const getStudentInfo = async(id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('invalid student ID');
    }

    const student = await Student.findById(id);
    if(!student) {
        throw new Error('Student not found');
    }
    return student;
};

const updateStudentInfoService = async(id, updates) => {
    const {name, notes, yeargroup, attendance} = updates;
    
    if (attendance !== undefined && (attendance < 0 || attendance > 100)) {
        throw new Error(' Attendance must be between 0 and 100');
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (notes !== undefined) updateFields.notes = notes;
    if (yeargroup !== undefined) updateFields.yeargroup = yeargroup;
    if (attendance !== undefined) updateFields.attendance = attendance;

    const updatedStudent = await Student.findByIdAndUpdate(id, updateFields, {new: true});
    
    if (!updatedStudent) {
        throw new Error('Student not found');
    }
    return updatedStudent;
};



module.exports = {
    addStudent,
    getStudentInfo,
    updateStudentInfoService,
};