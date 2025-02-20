import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles.css'; // Importing the CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const role = new URLSearchParams(location.search).get('role') || 'user';  // Default to 'user' if role is null
    <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h1>
    
    

    const handleLogin = async () => {
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password,
            role // Include role in the login request
          });
      
          if (res.data.role) {
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userRole', res.data.role);
      
            if (res.data.role === 'admin') {
              navigate('/admin-dashboard');
            } else {
              await axios.post('http://localhost:5000/api/auth/update-availability', {
                role: res.data.role,
                status: true,
              });
              navigate('/availability');
            }
          } else {
            alert('Invalid role');
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Invalid credentials');
        }
      };
      
    

    return (
        <div className="login-container"> {/* Apply the "login-container" class */}
            <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>

            {/* Add the registration link below the login button */}
            <p>
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    );
};

export default Login;
