import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css';

const PatientDashboard = () => {
  const [patientInfo, setPatientInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const userEmail = sessionStorage.getItem('userEmail');

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/patient-info?email=${userEmail}`);
        setPatientInfo(res.data);
      } catch (err) {
        console.error('Error fetching patient information:', err);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/medical-reports?email=${userEmail}`);
        console.log("Fetched Reports:", res.data.reports); // Debugging log
        setReports(res.data.reports);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchPatientInfo();
    fetchReports();
  }, [userEmail]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('report', file);
    formData.append('email', userEmail);

    try {
      await axios.post('http://localhost:5000/api/auth/upload-report', formData);
      alert('Upload successful');
      setFile(null);
      fetchReports(); // Refresh reports list without full page reload
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    }
  };

  return (
    <div className="patient-dashboard">
      <h1>Patient Dashboard</h1>
      
      {patientInfo ? (
        <div>
          <p><strong>Name:</strong> {patientInfo.name}</p>
          <p><strong>Age:</strong> {patientInfo.age}</p>
          <p><strong>Gender:</strong> {patientInfo.gender}</p>
          <p><strong>Contact:</strong> {patientInfo.contact}</p>
          <p><strong>Medical History:</strong> {patientInfo.medicalHistory}</p>
        </div>
      ) : (
        <p>Loading patient information...</p>
      )}

      <hr />

      {/* Medical Report Upload Section */}
      <div>
        <h2>Upload Medical Report</h2>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>

      <hr />

      {/* Display Uploaded Reports */}
      <div>
        <h2>Your Medical Reports</h2>
        {reports.length > 0 ? (
          <ul>
            {reports.map((report, index) => (
              <li key={index}>
                <a href={`http://localhost:5000${report.fileUrl}`} target="_blank" rel="noopener noreferrer">
                  {report.filename}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
