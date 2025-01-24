const express = require('express');
const {registerUser, loginUser, deleteAccount, logOut } = require('../controllers/userController.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout/:id', logOut);
router.delete('/account/:id', deleteAccount);

module.exports = router;