import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import VideoCall from './components/VideoCall';
import Availability from './components/Availability';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/availability" element={<Availability />} />
                <Route path="/video-call" element={<VideoCall />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />  {/* New Admin Route */}
                <Route path="/patient-dashboard" element={<PatientDashboard />} /> {/* New Route */}
            </Routes>
        </Router>
    );
}

export default App;