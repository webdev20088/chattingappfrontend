import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import styles from '../styles/Admin.module.css';

const socket = io('https://mychatappbackend-zzhh.onrender.com');

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [error, setError] = useState('');

  const BASE_URL = 'https://mychatappbackend-zzhh.onrender.com';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin?user=aniketadmin`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Error loading users');
    }
  };

  const fetchPairs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/analytics?user=aniketadmin`);
      const data = await res.json();
      setPairs(data);
    } catch (err) {
      setError('Error loading analytics');
    }
  };

  const clearPair = async (pair) => {
    const [user1, user2] = pair.split('-');
    await fetch(`${BASE_URL}/analytics/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'aniketadmin', user1, user2 })
    });
    fetchPairs();
  };

  const deleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
      const res = await fetch(`${BASE_URL}/user/${username}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'aniketadmin' })
      });
      if (res.ok) {
        fetchUsers();
        alert(`User "${username}" deleted successfully.`);
      } else {
        alert('Failed to delete user.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPairs();

    socket.on('userListUpdated', fetchUsers);
    socket.on('pairDataUpdated', fetchPairs);

    return () => {
      socket.off('userListUpdated', fetchUsers);
      socket.off('pairDataUpdated', fetchPairs);
    };
  }, []);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString(); // Formats as date + time
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <h2>Users</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Password (Encrypted)</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.username}</td>
                <td>{u.password}</td>
                <td>{u.online ? '🟢 Online' : '🔴 Offline'}</td>
                <td>{u.online ? '---' : formatLastSeen(u.lastSeen)}</td>
                <td>
                  <button
                    onClick={() => deleteUser(u.username)}
                    className={styles.clearBtn}
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h2>Chat Analytics</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Messages</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i}>
                <td>{p.pair}</td>
                <td>{p.count}</td>
                <td>{p.estimatedKB}</td>
                <td>
                  <button onClick={() => clearPair(p.pair)} className={styles.clearBtn}>Clear</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
