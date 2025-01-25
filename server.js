const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(cors());
app.use(express.json());

//mongodb connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to mongodb'))
.catch((err) => console.error('mongodb connection error: ', err));

mongoose.connection.on('error', (err) => {
    console.error('mongodb runtime connection error:', err);
})

//routes
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const openaiRoutes = require('./routes/openaiRoutes');

app.use('/api/users',userRoutes);
app.use('/api/classes',classRoutes);
app.use('/api/students',studentRoutes);
app.use('/api', openaiRoutes);

//test route
app.get('/', (req, res) => {
    res.send('smartseats backend is running');
});

//start the server
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
