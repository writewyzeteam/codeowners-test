import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { username, password });
      const authToken = response.data.token;
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed');
    }
  };

  useEffect(() => {
    if (!token) return;
    
    axios.get('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, [token]);

  if (!token) {
    return (
      <div className="login-form">
        <input 
          type="text" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.username}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
