import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import API_URL from './config';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`${API_URL}/api/admin/users`, {
        withCredentials: true
      });
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        navigate('/users');
      } else {
        setError('Failed to fetch users. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await Axios.put(`${API_URL}/api/admin/users/${userId}/approve`, {}, {
        withCredentials: true
      });
      setSuccessMessage('User approved successfully');
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user. Please try again.');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await Axios.put(`${API_URL}/api/admin/users/${userId}/make-admin`, {}, {
        withCredentials: true
      });
      setSuccessMessage('User is now an admin');
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error making user admin:', error);
      setError('Failed to make user admin. Please try again.');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await Axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        withCredentials: true
      });
      setSuccessMessage('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">User Management</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}

      <div className="table-responsive">
        <table className="table table-hover table-striped">
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.is_approved ? 'bg-success' : 'bg-warning'}`}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.is_admin ? 'bg-primary' : 'bg-secondary'}`}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    {!user.is_approved && (
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleApprove(user.id)}
                      >
                        Approve
                      </button>
                    )}
                    {!user.is_admin && (
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleMakeAdmin(user.id)}
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(userToDelete?.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUsers; 