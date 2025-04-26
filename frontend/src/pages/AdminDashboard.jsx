import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getLayouts, createUser, deleteUser, createLayout, deleteLayout, assignLayout } from '../services/api.service';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [layouts, setLayouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New user form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner'
  });
  
  // New layout form state
  const [showLayoutForm, setShowLayoutForm] = useState(false);
  const [newLayout, setNewLayout] = useState({
    name: '',
    ownerId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, layoutsResponse] = await Promise.all([
          getUsers(),
          getLayouts()
        ]);
        setUsers(usersResponse.data);
        setLayouts(layoutsResponse.data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      const response = await getUsers();
      setUsers(response.data);
      setShowUserForm(false);
      setNewUser({ name: '', email: '', password: '', role: 'owner' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleCreateLayout = async (e) => {
    e.preventDefault();
    try {
      // Create a new layout with empty aisles array
      await createLayout({
        ...newLayout,
        aisles: []
      });
      const response = await getLayouts();
      setLayouts(response.data);
      setShowLayoutForm(false);
      setNewLayout({ name: '', ownerId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create layout');
    }
  };

  const handleDeleteLayout = async (layoutId) => {
    if (window.confirm('Are you sure you want to delete this layout?')) {
      try {
        await deleteLayout(layoutId);
        setLayouts(layouts.filter(l => l._id !== layoutId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete layout');
      }
    }
  };

  const handleAssignLayout = async (layoutId, ownerId) => {
    try {
      await assignLayout(layoutId, ownerId);
      const response = await getLayouts();
      setLayouts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign layout');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <section className="users-section">
          <div className="section-header">
            <h2>Store Owners</h2>
            <button onClick={() => setShowUserForm(!showUserForm)} className="action-btn">
              {showUserForm ? 'Cancel' : 'Add Store Owner'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="form-container">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">Create User</button>
            </form>
          )}

          <div className="users-list">
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="delete-btn"
                          disabled={u._id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="layouts-section">
          <div className="section-header">
            <h2>Store Layouts</h2>
            <button onClick={() => setShowLayoutForm(!showLayoutForm)} className="action-btn">
              {showLayoutForm ? 'Cancel' : 'Add Layout'}
            </button>
          </div>

          {showLayoutForm && (
            <form onSubmit={handleCreateLayout} className="form-container">
              <div className="form-group">
                <label>Layout Name</label>
                <input
                  type="text"
                  value={newLayout.name}
                  onChange={(e) => setNewLayout({...newLayout, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign to Owner</label>
                <select
                  value={newLayout.ownerId}
                  onChange={(e) => setNewLayout({...newLayout, ownerId: e.target.value})}
                  required
                >
                  <option value="">Select Owner</option>
                  {users.filter(u => u.role === 'owner').map(owner => (
                    <option key={owner._id} value={owner._id}>{owner.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="submit-btn">Create Layout</button>
            </form>
          )}

          <div className="layouts-list">
            {layouts.length === 0 ? (
              <p>No layouts found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {layouts.map(layout => (
                    <tr key={layout._id}>
                      <td>{layout.name}</td>
                      <td>
                        {layout.owner ? (
                          layout.owner.name || 'Unknown'
                        ) : (
                          <select
                            onChange={(e) => handleAssignLayout(layout._id, e.target.value)}
                            value=""
                          >
                            <option value="">Assign to Owner</option>
                            {users.filter(u => u.role === 'owner').map(owner => (
                              <option key={owner._id} value={owner._id}>{owner.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => navigate(`/builder/${layout._id}`)}
                          className="edit-btn"
                        >
                          Edit Layout
                        </button>
                        <button 
                          onClick={() => handleDeleteLayout(layout._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
