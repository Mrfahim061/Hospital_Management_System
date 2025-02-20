import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './Chat';
import '../styles.css';

const Availability = () => {
  const [availability, setAvailability] = useState({ patient: false, doctor: false });
  const [canStartCall, setCanStartCall] = useState(false);
  const navigate = useNavigate();

  const userEmail = sessionStorage.getItem('userEmail');
  const userRole = sessionStorage.getItem('userRole');
  const userId = userEmail;
  const roomId = 'hospital_chat_room';

  useEffect(() => {
    const fetchAvailability = async () => {
      const res = await axios.get('http://localhost:5000/api/auth/availability');
      setAvailability(res.data);
      setCanStartCall(res.data.patient && res.data.doctor);
    };

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCall = () => {
    navigate('/video-call');
  };

  return (
    <div className="availability-container">
      <div className="availability-content">
        <h1>Availability</h1>
        <p>Patient Available: {availability.patient ? 'Yes' : 'No'}</p>
        <p>Doctor Available: {availability.doctor ? 'Yes' : 'No'}</p>
        <button onClick={handleStartCall} disabled={!canStartCall}>
          Start Call
        </button>
      </div>

      <Chat roomId={roomId} userId={userId} />

      {/* Patient Dashboard Button */}
      <div className="patient-dashboard-button">
        <button onClick={() => navigate('/patient-dashboard')}>Dashboard</button>
      </div>
    </div>
  );
};

export default Availability;
