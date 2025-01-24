const Class = require('../models/class');
const student = require('../models/student');
const mongoose = require("mongoose");

const createClass = async (req,res) => {
    const {name, userId, description} = req.body;

    try {
        
        const newClass = new Class({name, userId, description});
        await newClass.save();

        res.status(201).json({
            message: 'class created successfully', 
            class: newClass,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'error creating class',
            error: err.message,
        });
    }
};

const addStudentsToClass = async (req,res) => {
    const{classId, studentIds} = req.body;

    try {
        const classToUpdate = await Class.findById(classId);
        if (!classToUpdate) {
            return res.status(404).json({message: 'class not found'});
        }

        const validStudents = await student.find({_id: {$in: studentIds}});
        const validStudentIds = validStudents.map((student) => student._id.toString());
        const existingStudentIds = classToUpdate.students.map((id) => id.toString());
        const newStudents = validStudentIds.filter(
            (id) => !existingStudentIds.includes(id)
        );

        if (newStudents.length === 0) {
            return res.status(400).json({message: 'no new valid students to add.'})
        }

        classToUpdate.students.push(...newStudents);
        await classToUpdate.save();

        const updatedClass = await Class.findById(classId).populate('students', 'name');
        
        res.status(200).json({
            message: `Added ${newStudents.length} valid students to the class.`,
            newStudents,
            class: updatedClass,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'error adding students to class', 
            error: err.message
        });
    }
};

const getClasses = async(req,res) => {
    console.log('received query params:', req.query);
    const {userId} = req.query;
    
    if(!userId) {
        console.log('userid is missing');
        return res.status(400).json({message: 'UserId is required'});
    }

    try {
        const classes = await Class.find({ userId}).populate('students', 'name');
        console.log('classes retrieved: ', classes);
        
        res.status(200).json({
            message: 'classes retrieved successfully',
            classes,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({
            message:'error fetching classes',
            error: err.message,
        });
    }
};

const getClassById = async (req, res) => {
    const { id } = req.params;
    try {
      // Optionally, populate if you want students' or tests' data
      const classData = await Class.findById(id).populate('students', 'name');
      if (!classData) {
        return res.status(404).json({ message: 'class not found' });
      }
      res.status(200).json(classData);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'error fetching class by ID', error: err.message });
    }
  };

const createTestForClass = async(req, res) => {
    const {classId, testName, subject, date, scores } = req.body;

    try {
        const classToUpdate = await Class.findById(classId);
        if (!classToUpdate) {
            return res.status(500).json({message: 'class not found'});
        }

        const isDuplicate = classToUpdate.tests.some(test => test.testName === testName);
        if (isDuplicate) {
            return res.status(400).json({message: 'Test Name must be unique within the class'});
        }
        const newTest = {
            testName, 
            subject,
            date: date || Date.now(),
            results: scores || [],
        };

        classToUpdate.tests.push(newTest);

        await classToUpdate.save();

        const createdTest = classToUpdate.tests[classToUpdate.tests.length - 1];

        res.status(201).json({
            message: 'Test created successfully',
            test: createdTest,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error creating test', error: err.message});
    }
};

const addOrUpdateTestScores = async(req, res) => {
    const {classId, testId, scores} = req.body;

    try {
        const classToUpdate = await Class.findById(classId);
        if(!classToUpdate) {
            return res.status(404).json({message: 'class not found'});
        }

        const test = classToUpdate.tests.id(testId);
        if(!test) {
            return res.status(404).json({message: 'test not found'});
        }

        scores.forEach(({ studentId, score}) => {
            const resultIndex = test.results.findIndex(result => result.studentId.toString() ===studentId);
            if (resultIndex > -1 ) {
                test.results[resultIndex].score = score;
            } else {
                test.results.push({studentId, score});
            }
        });

        await classToUpdate.save();

        res.status(200).json({
            message: 'scores updated successfully',
            test,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error updating scores', error: err.message});
    }
}

const updateClassInfo = async(req,res) => {
    const {id} = req.params;
    const {name, description} = req.body;
    
    try {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;


        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({message: 'no fields provided for update'})
        }
        await Class.findByIdAndUpdate(id, {updateData});
        const updatedClass = await Class.findByIdAndUpdate(id, updateData, {
            new: true,
        }).populate("students", "name");
        
        if(!updatedClass) {
            return res.status(404).json({message: 'class not found'});
        }

        res.status(200).json({
            message: 'Class info updated successfully',
            class: updatedClass,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error updating class information', error: err.message});
    }
};

const deleteClass = async(req,res) => {
    const {id} = req.params;

    try {
        const classData = await Class.findByIdAndDelete(id);
        if(!classData) {
            return res.status(404).json({message: 'class not found'});
        }

        await student.updateMany(
            {classId: id},
            { $unset: {classId: ''}}
        );

        res.status(200).json({message:'class successfully deleted'});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error deleting class', error: err.message});
    }
};

const deleteTest = async(req, res) => {
    const {id, testId} = req.params;

    try {
        const updatedClass = await Class.findByIdAndUpdate(
            id, 
            {$pull: {tests: {_id: testId}}},
            {new: true }
        );

        if(!updatedClass) {
            return res.status(404).json({message: 'class not found'});
        }

        res.status(200).json({
            message: 'test removed successfully',
            class: updatedClass,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error deleting test', error: err.message});
    }
};

module.exports = {
    createClass, 
    addStudentsToClass, 
    createTestForClass,
    addOrUpdateTestScores,
    getClasses, 
    getClassById,
    updateClassInfo, 
    deleteClass,
    deleteTest,
};