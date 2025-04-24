import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import Axios from "axios";
import API_URL from './config';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`${API_URL}/users`);
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Members Listsssss</h2>
            <Link to="/users/add" className="btn btn-primary">
              Add New Member
            </Link>
          </div>

          <InputGroup className="mb-4">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <Table striped hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.age}</td>
                    <td>{user.type}</td>
                    <td>
                      <Link
                        to={`/users/${user.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserList;
