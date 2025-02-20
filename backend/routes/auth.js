const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Predefined Users
const predefinedUsers = [
    { email: 'patient@hospital.com', password: 'patient123', role: 'patient', name: 'John Doe', age: 30, gender: 'male', contact: '1234567890' },
    { email: 'doctor@hospital.com', password: 'doctor123', role: 'doctor', name: 'Dr. Smith', age: 40, gender: 'male', contact: '0987654321' },
    { email: 'fahim1915021@stud.kuet.ac.bd', password: 'fahim1915021', role: 'admin', name: 'Fahim Admin', age: 0, gender: 'N/A', contact: 'N/A' } // New Admin
];

// Seed Database with Predefined Users
predefinedUsers.forEach(async (user) => {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.create({ ...user, password: hashedPassword }); // Ensure all required fields are included
    }
});

// Login Route (Updated)
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;  // Receive the role from the frontend
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      if (user.role !== role) {
        return res.status(403).json({ message: 'Unauthorized for this role' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
      res.json({ token, role: user.role });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });  

// Patient info
router.get('/patient-info', async (req, res) => {
  const { email } = req.query;
  try {
    const patient = await User.findOne({ email, role: 'patient' }).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Register Route
router.post('/register', async (req, res) => {
    const { email, password, name, age, gender, contact, medicalHistory, role } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ 
        email, 
        password: hashedPassword, 
        name, 
        age: parseInt(age, 10),  // Convert age to an integer
        gender, 
        contact, 
        medicalHistory, 
        role 
      });
  
      await newUser.save();
      console.log('User saved successfully:', newUser);
      res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
   

// Fetch all registered users (For Admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['patient', 'doctor'] } }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err); // Log the error
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove a user (For Admin)
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// In-memory storage for availability
const availability = {
    patient: false, // Initially, the patient is not available
    doctor: false,  // Initially, the doctor is not available
};

// Update availability status
router.post('/update-availability', (req, res) => {
    const { role, status } = req.body; // Get the role (doctor/patient) and status (true/false) from the request body

    // Check if the role is valid (either 'patient' or 'doctor')
    if (role === 'patient' || role === 'doctor') {
        availability[role] = status; // Update the availability status
        return res.json({ message: `${role} availability updated`, availability });
    }

    // If the role is invalid, return an error
    return res.status(400).json({ message: 'Invalid role' });
});

// Get availability status
router.get('/availability', (req, res) => {
    res.json(availability); // Respond with the current availability status
});

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });

// Route for uploading a medical report
router.post('/upload-report', upload.single('report'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add the report details to the database
    user.medicalReports.push({
      filename: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    await user.save();
    res.json({ message: 'Report uploaded successfully', report: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Fetch all medical reports for a patient
router.get('/medical-reports', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ reports: user.medicalReports }); // Ensure reports are sent in response
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;