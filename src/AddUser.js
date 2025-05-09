import React, { useState } from 'react';
import { createBrowserHistory } from 'history'; // Import createBrowserHistory from history
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';
import { v4 as uuidv4 } from 'uuid';
import Axios from "axios";
import { useParams, useNavigate } from 'react-router-dom'; 
import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import API_URL from './config';

const history = createBrowserHistory(); // Create a browser history instance

const AddUser = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastVariant, setToastVariant] = useState("info");
  const navigate = useNavigate(); 

  const showDatabaseMessage = (title, message, variant = "info") => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const uuid = uuidv4();
    
    showDatabaseMessage("Database Access", "Attempting to add new member to database...");
    
    Axios.post(`${API_URL}/api/insert`, { id: uuid, name: name, age: age, type: type })
      .then(() => {
        setName("");
        setAge("");
        setType("");
        showDatabaseMessage("Success", "Member successfully added to database!", "success");
        setTimeout(() => {
          history.push('/');
          navigate('/users');
        }, 2000);
      })
      .catch((error) => {
        console.error('Error submitting member:', error);
        showDatabaseMessage("Error", "Failed to add member: " + error.message, "danger");
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
          <h2 className="text-center mb-4">Add Member</h2>
          <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '500px' }}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">Name:</InputGroup.Text>
              <Form.Control
                placeholder="Name"
                aria-label="Name"
                aria-describedby="basic-addon1"
                type='text'
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control-lg"
                autoComplete="name"
              />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon2">Age:</InputGroup.Text>
              <Form.Control
                placeholder="Age"
                aria-label="Age"
                aria-describedby="basic-addon2"
                type='text'
                name="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="form-control-lg"
                autoComplete="off"
              />
            </InputGroup>

            <InputGroup className="mb-4">
              <InputGroup.Text id="basic-addon3">Type:</InputGroup.Text>
              <Form.Select
                aria-label="Type"
                aria-describedby="basic-addon3"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-control-lg"
                autoComplete="off"
              >
                <option value="">Select type</option>
                <option value="junior">Junior</option>
                <option value="teen">Teen</option>
                <option value="senior">Senior</option>
              </Form.Select>
            </InputGroup>

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
                Add Member
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddUser;
