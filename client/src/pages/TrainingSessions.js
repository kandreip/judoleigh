import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function TrainingSessions() {
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'Regular',
    instructor: '',
    maxParticipants: 20
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sessions', formData);
      setShowModal(false);
      fetchSessions();
      setFormData({
        date: '',
        time: '',
        type: 'Regular',
        instructor: '',
        maxParticipants: 20
      });
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  return (
    <Container>
      <h1>Training Sessions</h1>
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        Add New Session
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Instructor</th>
            <th>Max Participants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session._id}>
              <td>{new Date(session.date).toLocaleDateString()}</td>
              <td>{session.time}</td>
              <td>{session.type}</td>
              <td>{session.instructor}</td>
              <td>{session.maxParticipants}</td>
              <td>
                <Button variant="info" size="sm" className="me-2">View</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Training Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Session Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Regular">Regular</option>
                <option value="Competition">Competition</option>
                <option value="Grading">Grading</option>
                <option value="Special">Special</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Instructor</Form.Label>
              <Form.Control
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Maximum Participants</Form.Label>
              <Form.Control
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                min="1"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Add Session</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TrainingSessions; 