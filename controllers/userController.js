const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {

        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
            throw new Error('JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables');
        }
        //check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user 
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        //generate a JWT
        const token = jwt.sign(
            {id: savedUser._id, email: savedUser.email },
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {id: savedUser._id, name: savedUser.name, email: savedUser.email },
            token,
        });
    } catch (error) {
        console.error(error);
        console.error('error during registration:', error.message);
        res.status(500).json({message: 'error registering user'});
    }
};

const loginUser = async(req,res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({message: 'Invalid email or password'});
        }

        const token = jwt.sign(
            {id: user._id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        })
        
        res.status(200).json({
            message: 'login successful',
            user: {id: user._id, name: user.name, email: user.email},
            token,
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'error logging in', error: err.message});
    }
};

const logOut = async(req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.status(200).json({message: 'logout successful'});
    } catch(err) {
        console.error('error during logout', err.message);
        res.status(500).json({message: 'error logging out '});
    }
};

const deleteAccount = async(req,res) => {
    const userId = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json({message: 'user deleted successfully', user: deletedUser});

    } catch(err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({message: 'error deleting user', error: err.message});
    }
};

module.exports = { registerUser, loginUser, logOut, deleteAccount };