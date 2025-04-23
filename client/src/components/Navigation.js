import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Leigh Judo Club</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/members">Members</Nav.Link>
            <Nav.Link as={Link} to="/sessions">Training Sessions</Nav.Link>
            <Nav.Link as={Link} to="/attendance">Attendance</Nav.Link>
            <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 