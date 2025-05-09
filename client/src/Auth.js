import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { Card, Form, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { useAuth } from './AuthContext';
import API_URL from './config';
import LoadingAnimation from './components/LoadingAnimation';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [toastVariant, setToastVariant] = useState('info');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const showMessage = (title, message, variant = 'info') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!isLogin) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      errors.username = 'Username must be between 3 and 20 characters';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    if (isLogin) {
      try {
        const startTime = Date.now();
        const success = await login(username, password);
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime); // Ensure at least 2 seconds total

        if (success) {
          showMessage('Success', 'Login successful!', 'success');
          setTimeout(() => {
            navigate('/users');
          }, remainingTime);
        } else {
          showMessage('Error', 'Login failed. Please check your credentials.', 'danger');
          setIsLoading(false);
        }
      } catch (error) {
        showMessage('Error', error.message, 'danger');
        setIsLoading(false);
      }
    } else {
      try {
        const startTime = Date.now();
        const response = await Axios.post(`${API_URL}/api/register`, {
          username,
          email,
          password
        });
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 2000 - elapsedTime); // Ensure at least 2 seconds total
        
        if (response.data === 'User registered successfully') {
          showMessage('Success', 'Registration successful! Please wait for admin approval.', 'success');
          setTimeout(() => {
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setUsername('');
            setIsLoading(false);
          }, remainingTime);
        }
      } catch (error) {
        const errorMessage = error.response?.data || 'Registration failed';
        showMessage('Error', errorMessage, 'danger');
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

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

      <Card className="shadow-lg border-0 mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-primary">{isLogin ? 'Login' : 'Register'}</h2>
            <p className="text-muted">Welcome to Leigh Judo Club Management System!!!!!</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!!validationErrors.username}
                required
                className="form-control-lg"
              />
              {validationErrors.username && (
                <Form.Control.Feedback type="invalid">
                  {validationErrors.username}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {!isLogin && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!validationErrors.email}
                  required
                  className="form-control-lg"
                />
                {validationErrors.email && (
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!validationErrors.password}
                required
                className="form-control-lg"
              />
              {validationErrors.password && (
                <Form.Control.Feedback type="invalid">
                  {validationErrors.password}
                </Form.Control.Feedback>
              )}
              {!isLogin && (
                <Form.Text className="text-muted">
                  Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                className="rounded-pill"
                disabled={isLoading}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
            </div>

            <div className="text-center mt-3">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setValidationErrors({});
                }}
                className="text-decoration-none"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Auth; 