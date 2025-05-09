import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import Axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import API_URL from './config';

const UserView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserAge, setEditUserAge] = useState("");
  const [editUserType, setEditUserType] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [timePeriod, setTimePeriod] = useState('overall');

  useEffect(() => {
    fetchUserDetails();
    fetchTrainingSessions();
    // fetchTotalSessions();
  }, [userId, timePeriod]);

  const fetchTotalSessions = async () => {
    try {
      // Calculate total sessions from the training sessions data
      setTotalSessions(trainingSessions.length);
    } catch (error) {
      console.error('Error calculating total sessions:', error);
      setError('Failed to calculate total sessions. Please try again later.');
    }
  };

  useEffect(() => {
    if (trainingSessions.length > 0) {
      const attendedSessions = trainingSessions.filter(session => session.payment_status === 'paid').length;
      const missedSessions = trainingSessions.length - attendedSessions;
      
      setAttendanceData([
        { name: 'Attended', value: attendedSessions, color: '#137333' },
        { name: 'Missed', value: missedSessions, color: '#d93025' }
      ]);
      // Update total sessions when training sessions change
      fetchTotalSessions();
    } else {
      setAttendanceData([
        { name: 'Attended', value: 0, color: '#137333' },
        { name: 'Missed', value: 0, color: '#d93025' }
      ]);
      setTotalSessions(0);
    }
  }, [trainingSessions]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`${API_URL}/api/users/${userId}`);
      setUserDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingSessions = async () => {
    try {
      const response = await Axios.get(`${API_URL}/api/members/${userId}/training-sessions?period=${timePeriod}`);
      setTrainingSessions(response.data);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      setError('Failed to fetch training sessions. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditUserName(userDetails.name);
    setEditUserAge(userDetails.age);
    setEditUserType(userDetails.type);
  };

  const handleUpdate = async () => {
    try {
      await Axios.put(`${API_URL}/api/update/${userId}`, { 
        name: editUserName, 
        age: editUserAge, 
        type: editUserType 
      });
      setEditMode(false);
      setSuccessMessage('User updated successfully!');
      fetchUserDetails();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleCancelView = () => {
    navigate('/users');
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };

  const confirmDelete = async () => {
    try {
      await Axios.delete(`${API_URL}/api/delete/${userId}`);
      setShowConfirmModal(false);
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
      setShowConfirmModal(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${value} sessions`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/users')}
              className="back-button"
            >
              ← Back to Members
            </Button>
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
          </div>

          <div className="member-details">
            <div className="member-header">
              <h2 className="member-title">Member Details</h2>
              <div className="action-buttons">
                {!editMode && (
                  <Button 
                    variant="primary" 
                    onClick={handleEdit}
                    className="action-button edit"
                  >
                    Edit Member
                  </Button>
                )}
                <Button 
                  variant="danger" 
                  onClick={() => setShowConfirmModal(true)}
                  className="action-button cancel"
                >
                  Delete Member
                </Button>
              </div>
            </div>

            {editMode ? (
              <div className="edit-form">
                <Form>
                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Age</Form.Label>
                    <Form.Control
                      type="number"
                      value={editUserAge}
                      onChange={(e) => setEditUserAge(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label className="form-label">Type</Form.Label>
                    <Form.Select
                      value={editUserType}
                      onChange={(e) => setEditUserType(e.target.value)}
                      className="form-control"
                    >
                      <option value="junior">Junior</option>
                      <option value="teen">Teen</option>
                      <option value="senior">Senior</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="action-buttons">
                    <Button 
                      variant="primary" 
                      onClick={handleUpdate}
                      className="action-button edit"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleCancelEdit}
                      className="action-button cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            ) : (
              <div className="member-info">
                <div className="info-group">
                  <div className="info-label">Name</div>
                  <div className="info-value">{userDetails.name}</div>
                </div>
                <div className="info-group">
                  <div className="info-label">Age</div>
                  <div className="info-value">{userDetails.age}</div>
                </div>
                <div className="info-group">
                  <div className="info-label">Type</div>
                  <div className="info-value">{userDetails.type}</div>
                </div>
              </div>
            )}
          </div>

          <div className="training-sessions">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="sessions-title">Training Sessions</h3>
              <Form.Select
                className="w-auto"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                <option value="overall">Overall</option>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
              </Form.Select>
            </div>
            
            {trainingSessions.length > 0 && (
              <div className="attendance-graph">
                <h4 className="graph-title">Attendance Overview</h4>
                <div className="attendance-stats">
                  <p>Total Sessions: {totalSessions}</p>
                  <p>Attendance Rate: {attendanceData[0] ? ((attendanceData[0].value / totalSessions) * 100).toFixed(1) : 0}%</p>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderCustomizedLabel}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} sessions`, name]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                        formatter={(value) => {
                          const data = attendanceData.find(d => d.name === value);
                          return `${value} (${data ? data.value : 0} sessions)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {trainingSessions.length > 0 ? (
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingSessions.map((session) => (
                    <tr key={session.id}>
                      <td>{formatDate(session.date)}</td>
                      <td>
                        <span className={`payment-badge ${session.payment_status}`}>
                          {session.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No training sessions found.</p>
            )}
          </div>
        </>
      )}

      <Modal show={showConfirmModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this member? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserView;
