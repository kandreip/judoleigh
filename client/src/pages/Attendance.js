import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sessionId: '',
    memberId: '',
    attended: true,
    notes: ''
  });

  useEffect(() => {
    fetchAttendance();
    fetchSessions();
    fetchMembers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/attendance', formData);
      setShowModal(false);
      fetchAttendance();
      setFormData({
        sessionId: '',
        memberId: '',
        attended: true,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding attendance:', error);
    }
  };

  return (
    <Container>
      <h1>Attendance</h1>
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        Record Attendance
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Member</th>
            <th>Session</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map(record => (
            <tr key={record._id}>
              <td>{new Date(record.session.date).toLocaleDateString()}</td>
              <td>{record.member.name}</td>
              <td>{record.session.type}</td>
              <td>{record.attended ? 'Present' : 'Absent'}</td>
              <td>{record.notes}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Training Session</Form.Label>
              <Form.Select
                value={formData.sessionId}
                onChange={(e) => setFormData({...formData, sessionId: e.target.value})}
                required
              >
                <option value="">Select a session</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {new Date(session.date).toLocaleDateString()} - {session.type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Member</Form.Label>
              <Form.Select
                value={formData.memberId}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                required
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Attended"
                checked={formData.attended}
                onChange={(e) => setFormData({...formData, attended: e.target.checked})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Form.Group>
            <Button variant="primary" type="submit">Save Attendance</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Attendance; 