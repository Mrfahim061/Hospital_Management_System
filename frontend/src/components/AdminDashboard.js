import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css'; // Import the CSS file

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
                fetchUsers(); // Refresh list after deletion
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="remove-btn" onClick={() => handleDelete(user._id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
