import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Toast, ToastContainer, Row, Col } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateTrainingSession = () => {
  const [date, setDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [toastVariant, setToastVariant] = useState('info');
  const [memberDetails, setMemberDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all members when component mounts
    Axios.get('http://localhost:3001/api/users')
      .then((response) => {
        setMembers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching members:', error);
        showMessage('Error', 'Failed to fetch members: ' + error.message, 'danger');
      });
  }, []);

  const showMessage = (title, message, variant = 'info') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleMemberSelection = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        // Remove member details when unselected
        const newDetails = { ...memberDetails };
        delete newDetails[memberId];
        setMemberDetails(newDetails);
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handlePaymentStatusChange = (memberId, status) => {
    setMemberDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        paymentStatus: status
      }
    }));
  };

  const handleDetailsChange = (memberId, details) => {
    setMemberDetails(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        details
      }
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!date) {
      showMessage('Error', 'Please select a date', 'danger');
      return;
    }

    if (selectedMembers.length === 0) {
      showMessage('Error', 'Please select at least one member', 'danger');
      return;
    }

    const sessionId = uuidv4();
    
    showMessage('Database Access', 'Creating new training session...');
    
    const membersWithDetails = selectedMembers.map(memberId => ({
      id: memberId,
      paymentStatus: memberDetails[memberId]?.paymentStatus || 'unpaid',
      details: memberDetails[memberId]?.details || ''
    }));
    
    Axios.post('http://localhost:3001/api/training-sessions', {
      id: sessionId,
      date: date,
      members: membersWithDetails
    })
      .then(() => {
        setDate('');
        setSelectedMembers([]);
        setMemberDetails({});
        showMessage('Success', 'Training session created successfully!', 'success');
        setTimeout(() => {
          navigate('/training-sessions');
        }, 2000);
      })
      .catch((error) => {
        console.error('Error creating training session:', error);
        showMessage('Error', 'Failed to create training session: ' + error.message, 'danger');
      });
  };

  return (
    <div className="container">
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

      <Card className="shadow-sm border-0 mt-5">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Create Training Session</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Select Members</Form.Label>
              <div className="member-selection-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {members.map((member) => (
                  <div key={member.id} className="mb-3 p-3 border rounded">
                    <Form.Check
                      type="checkbox"
                      id={`member-${member.id}`}
                      label={`${member.name} (${member.type})`}
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberSelection(member.id)}
                      className="mb-2"
                    />
                    
                    {selectedMembers.includes(member.id) && (
                      <div className="ms-4">
                        <Form.Group className="mb-2">
                          <Form.Label>Payment Status</Form.Label>
                          <Form.Select
                            value={memberDetails[member.id]?.paymentStatus || 'unpaid'}
                            onChange={(e) => handlePaymentStatusChange(member.id, e.target.value)}
                          >
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Form.Group>
                          <Form.Label>Details</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Enter any additional details..."
                            value={memberDetails[member.id]?.details || ''}
                            onChange={(e) => handleDetailsChange(member.id, e.target.value)}
                          />
                        </Form.Group>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>

            <div className="text-center">
              <Button 
                variant="primary" 
                type="submit"
                className="px-4 py-2 rounded-pill"
                style={{
                  transition: 'all 0.3s ease',
                  borderWidth: '2px'
                }}
              >
                Create Session
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateTrainingSession; 