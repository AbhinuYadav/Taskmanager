import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow sticky-top">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/dashboard" className="fw-bold">
          📋 TaskManager
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            {user.role === 'admin' ? (
              <>
                <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
                <Nav.Link as={Link} to="/members">Members</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/my-tasks">My Tasks</Nav.Link>
            )}
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <div className="text-light">
              👤 {user.username} <span className="badge bg-info ms-1">{user.role}</span>
            </div>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;