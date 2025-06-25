// ✅ FINAL chat.js (localhost:4000)
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import styles from '../styles/chat.module.css';
import { useRouter } from 'next/router';

const socket = io('https://mychatappbackend-zzhh.onrender.com');
const redirectLinks = [
  
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/amorphous-and-crystalline-solids',
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/assertion-and-reason',
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/calculations-involving-unit-cell-dimensions',
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/classification-of-crystalline-solids',
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/crystalline-and-unit-cells',
  'https://www.doubtnut.com/class-12/chemistry/mtg-chemistry-english/the-solid-state/exemplar-problems',
  
];

export default function Chat() {
  const [username, setUsername] = useState('');
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchName, setSearchName] = useState('');
  const [typing, setTyping] = useState('');
  const [maximized, setMaximized] = useState(false);
  const chatBoxRef = useRef(null);
  const typingTimeout = useRef(null);

  const router = useRouter();

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  const fetchMessages = useCallback(async (contact) => {
    try {
      const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/messages?user1=${username}&user2=${contact}`);
      if (!res.ok) throw new Error('Failed to fetch messages');

      const data = await res.json();
      setMessages(data);
      setSelectedContact(contact);
      setMaximized(true);

      socket.emit('joinRoom', `${username}_${contact}`);
      socket.emit('joinRoom', `${contact}_${username}`);
      socket.emit('markRead', { user1: username, user2: contact });

      scrollToBottom();
    } catch (err) {
      if (document.visibilityState === 'hidden') return;
      console.error('⚠️ Error fetching messages:', err.message);
      // 🔇 NO ALERT, only log
    }
  }, [username]);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) {
      router.replace('/login');
    } else {
      setUsername(user);
      socket.emit('login', user);

      if (user === 'ditto') {
        fetchMessages('flora');
      } else if (user === 'flora') {
        fetchMessages('ditto');
      }
    }
  }, [router, fetchMessages]);

  useEffect(() => {
    socket.on('onlineUsers', (users) => setOnlineUsers(users));
    socket.on('newMessage', (msg) => {
      if (selectedContact && (msg.sender === selectedContact || msg.receiver === selectedContact)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });
    socket.on('typing', ({ sender, isTyping }) => {
      if (sender === selectedContact) setTyping(isTyping ? `${sender} is typing...` : '');
    });
    socket.on('cleared', () => setMessages([]));
    socket.on('refresh', () => {
      if (selectedContact) fetchMessages(selectedContact);
    });

    return () => {
      socket.off('onlineUsers');
      socket.off('newMessage');
      socket.off('typing');
      socket.off('cleared');
      socket.off('refresh');
    };
  }, [selectedContact, fetchMessages]);

  const handleSearch = async () => {
    if (!searchName || searchName === username) return;
    const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/user/${searchName}`);
    if (!res.ok) {
      console.error('No such user.'); // 🔇 NO ALERT
      return;
    }
    fetchMessages(searchName);
    setSearchName('');
  };

  const sendMessage = () => {
    if (!message || !selectedContact) return;
    socket.emit('sendMessage', {
      sender: username,
      receiver: selectedContact,
      message,
      room: `${username}_${selectedContact}`
    });
    setMessage('');
    socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
  };

  const clearChat = () => socket.emit('clearChat', { user1: username, user2: selectedContact });

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: true });
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
    }, 1000);
  };

  const handleLogout = () => {
    socket.emit('logout', username);
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleDrive = () => {
    if (['ditto', 'flora'].includes(username)) {
      socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
      setTimeout(() => {
        window.location.href = 'https://drive.google.com/drive/folders/1yUYVWUZi-m6z5Uy0NrmveN1kkLVvClHY';
      }, 100);
    }
  };

  const handleRedirect = () => {
    if (['ditto', 'flora'].includes(username)) {
      const link = redirectLinks[Math.floor(Math.random() * redirectLinks.length)];
      socket.emit('sendMessage', {
        sender: username,
        receiver: selectedContact,
        message: 'this is the auto generated message he/she has to go',
        room: `${username}_${selectedContact}`
      });
      socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
      setTimeout(() => {
        window.location.href = link;
      }, 500);
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        ...(username === 'ditto' || username === 'flora'
          ? { background: 'linear-gradient(to right, #ffefba, #ffffff)' }
          : {})
      }}
    >
      {!maximized && (
        <div className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <h3 className={styles.nametext}>Hi, {username}!</h3>
            <button onClick={handleLogout} className={styles.button}>Logout</button>
          </div>
          <div className={styles.searchBar}>
            <input
              placeholder="Search username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className={styles.inputBox}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button onClick={handleSearch} className={styles.button}>Search</button>
          </div>
        </div>
      )}

      {selectedContact && (
        <div className={`${styles.chatSection} ${maximized ? styles.maximized : ''}`}>
          <div className={styles.chatHeader}>
            <button
              className={styles.button}
              onClick={() => { window.location.reload(); }}
            >⬅</button>
            <button onClick={handleDrive} className={styles.button} disabled={!['ditto', 'flora'].includes(username)}><b>DRIVE</b></button>
            <button onClick={handleRedirect} className={styles.button} disabled={!['ditto', 'flora'].includes(username)}><b>REDIRECT</b></button>
            <button onClick={clearChat} className={styles.button}>Clear Chat</button>
            <h3 className={styles.nametext}>
              {selectedContact} {onlineUsers.includes(selectedContact)
                ? <span className={styles.online}> (online)</span>
                : <span className={styles.offline}> (offline)</span>}
            </h3>
          </div>

          <div className={styles.typingText}>{typing}</div>

          <div className={styles.chatBox} ref={chatBoxRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.messageBubble} ${m.sender === username ? styles.sent : styles.received}`}
              >
                <div className={styles.messageContent}>{m.message}</div>
                <div className={styles.messageMeta}>
                  <small>{new Date(m.timestamp).toLocaleTimeString()} {m.sender === username ? (m.read ? '✓✓' : '✓') : ''}</small>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.inputSection}>
            <input
              value={message}
              onChange={handleTyping}
              placeholder="Type..."
              className={styles.inputBox}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} className={styles.button}>Send</button>
            
          </div>
        </div>
      )}
    </div>
  );
}
