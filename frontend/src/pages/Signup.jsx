import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Signup = () => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signup(userData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '450px' }} className="shadow-lg">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h1 className="h3">📝 Create Account</h1>
            <p className="text-muted">Join Task Manager today</p>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Choose username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Create password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Role</Form.Label>
              <div>
                <Form.Check
                  inline
                  label="Member"
                  type="radio"
                  value="member"
                  checked={userData.role === 'member'}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                />
                <Form.Check
                  inline
                  label="Admin"
                  type="radio"
                  value="admin"
                  checked={userData.role === 'admin'}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                />
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              Already have an account? Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;