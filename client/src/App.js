import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import UserList from './UserList';
import AddUser from './AddUser';
import UserView from './UserView';
import CreateTrainingSession from './CreateTrainingSession';
import TrainingSessionsList from './TrainingSessionsList';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';
import AdminUsers from './AdminUsers';

// Navigation component
const Navigation = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" variant="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img 
            src="/images/logo.png" 
            alt="Judo Leigh Logo" 
            style={{ height: '40px' }}
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/users" className={location.pathname === '/users' ? 'active' : ''}>
                  Members
                </Nav.Link>
                <Nav.Link as={Link} to="/training-sessions" className={location.pathname === '/training-sessions' ? 'active' : ''}>
                  Training Sessions
                </Nav.Link>
                {user.isAdmin && (
                  <Nav.Link as={Link} to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                    User Management
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user && (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-muted">Welcome, {user.username}</span>
                </Nav.Item>
                <Nav.Link 
                  onClick={handleLogout}
                  className="logout"
                >
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/users" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <Container>
            <Routes>
              <Route path="/" element={<Navigate to="/users" />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/users" element={<PrivateRoute><UserList /></PrivateRoute>} />
              <Route path="/users/add" element={<PrivateRoute><AddUser /></PrivateRoute>} />
              <Route path="/users/:userId" element={<PrivateRoute><UserView /></PrivateRoute>} />
              <Route path="/training-sessions" element={<PrivateRoute><TrainingSessionsList /></PrivateRoute>} />
              <Route path="/training-sessions/create" element={<PrivateRoute><CreateTrainingSession /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
            </Routes>
          </Container>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
