import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // Importing your CSS

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1>Welcome to XYZ Hospital!</h1>
      <h2>Identify Yourself</h2>
      <div className="icon-container">
        <div className="icon-item" onClick={() => navigate('/login?role=patient')}>
          <img src="/images/patient-icon.png" alt="Patient" className="icon-image" />
          <p>Patient</p>
        </div>
        <div className="icon-item" onClick={() => navigate('/login?role=doctor')}>
          <img src="/images/doctor-icon.png" alt="Doctor" className="icon-image" />
          <p>Doctor</p>
        </div>
        <div className="icon-item" onClick={() => navigate('/login?role=admin')}>
          <img src="/images/admin-icon.png" alt="Admin" className="icon-image" />
          <p>Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
