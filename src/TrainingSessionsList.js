import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Toast, ToastContainer, InputGroup } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TrainingSessionsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [toastVariant, setToastVariant] = useState('info');
  const [allMembers, setAllMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [error, setError] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    fetchAllMembers();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await Axios.get('http://localhost:3001/api/training-sessions');
      console.log('Fetched sessions:', response.data);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      showMessage('Error', 'Failed to fetch training sessions', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const response = await Axios.get('http://localhost:3001/api/users');
      setAllMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      showMessage('Error', 'Failed to fetch members', 'danger');
    }
  };

  const showMessage = (title, message, variant = 'info') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleEdit = async (session) => {
    try {
      setLoading(true);
      console.log('Session being edited:', session);
      
      if (!session || !session.id) {
        showMessage('Error', 'Invalid session data', 'danger');
        return;
      }

      const sessionId = encodeURIComponent(session.id);
      const response = await Axios.get(`http://localhost:3001/api/training-sessions/${sessionId}`);
      console.log('Fetched session details:', response.data);
      
      if (response.data) {
        const formattedSession = {
          ...response.data,
          date: response.data.date.split('T')[0]
        };
        setSelectedSession(formattedSession);
        
        // Calculate available members (members not already in the session)
        const currentMemberIds = formattedSession.members.map(m => m.id);
        const available = allMembers.filter(member => !currentMemberIds.includes(member.id));
        setAvailableMembers(available);
        
        setShowEditModal(true);
      } else {
        showMessage('Error', 'Session data not found', 'danger');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      if (error.response?.status === 404) {
        showMessage('Error', 'Session not found', 'danger');
      } else {
        showMessage('Error', `Failed to fetch session details: ${error.message}`, 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (sessionId) => {
    setSessionToDelete(sessionId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Axios.delete(`http://localhost:3001/api/training-sessions/${sessionToDelete}`);
      setShowConfirmModal(false);
      setSessionToDelete(null);
      setSuccessMessage('Session deleted successfully!');
      fetchSessions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session. Please try again.');
      setShowConfirmModal(false);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSessionToDelete(null);
  };

  const handleSave = async () => {
    try {
      await Axios.put(`http://localhost:3001/api/training-sessions/${selectedSession.id}`, {
        date: selectedSession.date,
        members: selectedSession.members
      });
      showMessage('Success', 'Training session updated successfully', 'success');
      setShowEditModal(false);
      fetchSessions();
    } catch (error) {
      console.error('Error updating training session:', error);
      showMessage('Error', 'Failed to update training session', 'danger');
    }
  };

  const handleMemberStatusChange = (memberId, field, value) => {
    setSelectedSession(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId 
          ? { ...member, [field]: value }
          : member
      )
    }));
  };

  const handleDeleteMember = (memberId) => {
    setSelectedSession(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleAddMember = (memberId) => {
    if (!memberId) return; // Don't proceed if no member is selected
    
    const memberToAdd = allMembers.find(m => m.id === memberId);
    if (memberToAdd) {
      setSelectedSession(prev => ({
        ...prev,
        members: [...prev.members, {
          id: memberToAdd.id,
          name: memberToAdd.name,
          type: memberToAdd.type,
          paymentStatus: 'unpaid',
          details: ''
        }]
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredSessions = sessions.filter(session => {
    if (!session) return false;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Format the date for search
    const formattedDate = formatDate(session.date).toLowerCase();
    
    // Check if the search term matches the date
    if (formattedDate.includes(searchLower)) {
      return true;
    }
    
    // Check if any member's name or type matches the search term
    if (session.members && Array.isArray(session.members)) {
      return session.members.some(member => {
        if (!member) return false;
        return (
          (member.name && member.name.toLowerCase().includes(searchLower)) ||
          (member.type && member.type.toLowerCase().includes(searchLower))
        );
      });
    }
    
    return false;
  });

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
    <div className="training-session-container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">{toastTitle}</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="training-session-header">
        <InputGroup className="training-session-search">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button 
          variant="primary" 
          onClick={() => navigate('/training-sessions/create')}
          className="create-button"
          style={{ width: 'auto', minWidth: '150px' }}
        >
          Create New Session
        </Button>
      </div>

      <div className="table-responsive">
        <Table className="training-session-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id}>
                <td>{formatDate(session.date)}</td>
                <td>
                  <div className="training-session-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(session)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        className="training-session-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Training Session</Modal.Title>
        </Modal.Header>
        <Modal.Body className="training-session-modal-body">
          {selectedSession && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedSession.date}
                  onChange={(e) => setSelectedSession({...selectedSession, date: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Add Member</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select
                    value=""
                    onChange={(e) => handleAddMember(e.target.value)}
                  >
                    <option value="">Select a member...</option>
                    {availableMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.type})
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>

              <div className="training-session-member-list">
                {selectedSession.members.map((member) => (
                  <div key={member.id} className="training-session-member-card">
                    <div className="training-session-member-info">
                      <strong>{member.name}</strong>
                      <div className="text-muted">{member.type}</div>
                    </div>
                    <div className="training-session-member-actions">
                      <Form.Select
                        size="sm"
                        value={member.paymentStatus}
                        onChange={(e) => handleMemberStatusChange(member.id, 'paymentStatus', e.target.value)}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </Form.Select>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this training session?
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

export default TrainingSessionsList; 