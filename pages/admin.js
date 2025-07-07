import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import styles from '../styles/Admin.module.css';

const socket = io('https://mychatappbackend-zzhh.onrender.com');

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [error, setError] = useState('');

  const BASE_URL = 'https://mychatappbackend-zzhh.onrender.com';

  // Fetch user list (admin only)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin?user=aniketadmin`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Error loading users');
    }
  };

  // Fetch chat analytics (admin only)
  const fetchPairs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/analytics?user=aniketadmin`);
      const data = await res.json();
      setPairs(data);
    } catch (err) {
      setError('Error loading analytics');
    }
  };

  // Admin clears chat for a pair (and resets total count)
  const clearPair = async (pair) => {
    const [user1, user2] = pair.split('-');
    const res = await fetch(`${BASE_URL}/analytics/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 'aniketadmin',
        user1,
        user2,
        clearTotal: true
      })
    });

    if (res.ok) {
      fetchPairs();
      alert(`Chat history between "${pair}" has been cleared.`);
    } else {
      alert('Failed to clear chat for this pair.');
    }
  };

  // Delete user from system
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

  // On load and socket update
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

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>
      {error && <div className={styles.error}>{error}</div>}

      {/* USERS SECTION — Floating Card Style */}
      <div className={styles.section}>
        <h2>Users</h2>
        <div className={styles.userGrid}>
          {users.map((u, i) => (
            <div key={i} className={styles.userCard}>
              <h3>{u.username}</h3>
              <p>Password: •••••••</p>
              <p>Status: {u.online ? '🟢 Online' : '🔴 Offline'}</p>
              <p>Usage: {u.sessionDuration || 0} min</p>
              <p>Last Seen: {u.lastSeen}</p>
              <button
                onClick={() => deleteUser(u.username)}
                className={styles.clearBtn}
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT ANALYTICS SECTION — Table */}
      <div className={styles.section}>
        <h2>Chat Analytics</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Total Messages (all time)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i}>
                <td>{p.pair}</td>
                <td>{p.totalCount}</td>
                <td>
                  <button
                    onClick={() => clearPair(p.pair)}
                    className={styles.clearBtn}
                  >
                    Clear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
