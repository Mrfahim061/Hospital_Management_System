import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    medicalHistory: '',
    role: 'patient'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert(res.data.message); // Show success message
      navigate('/login');      // Navigate to login page
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
   

  return (
    <div className="login-container">
      <h1>Registration</h1>
      
      {/* Role Selection at the Top */}
      <label>Register as a: </label>
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>

      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
      <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} />
      
      {/* Gender Label and Dropdown */}
      <label></label>
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} />
      
      <textarea
        name="medicalHistory"
        placeholder={formData.role === 'doctor' ? "Doctor's Additional Information" : "Medical History"}
        value={formData.medicalHistory}
        onChange={handleChange}
      />
      
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
      
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;
