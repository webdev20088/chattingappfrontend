import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import styles from '../styles/chat.module.css';

const socket = io('http://localhost:4000');

export default function Chat() {
  const [username, setUsername] = useState('');
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [searchName, setSearchName] = useState('');
  const [typing, setTyping] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) window.location.href = '/login';
    else {
      setUsername(user);
      socket.emit('login', user);
      loadContacts();
    }

    socket.on('onlineUsers', (users) => setOnlineUsers(users));

    socket.on('newMessage', (msg) => {
      if (
        selectedContact &&
        (msg.sender === selectedContact || msg.receiver === selectedContact)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      loadContacts();
    });

    socket.on('typing', ({ sender, isTyping }) => {
      if (sender === selectedContact) {
        setTyping(isTyping ? `${sender} is typing...` : '');
      }
    });

    socket.on('cleared', () => {
      setMessages([]);
      loadContacts();
    });

    socket.on('refreshContacts', loadContacts);

    return () => {
      socket.off('onlineUsers');
      socket.off('newMessage');
      socket.off('typing');
      socket.off('cleared');
      socket.off('refreshContacts');
    };
  }, [selectedContact]);

  const loadContacts = async () => {
    const res = await fetch(`http://localhost:4000/contacts/${username}`);
    const data = await res.json();
    setContacts(data);

    if (data.length && !selectedContact) {
      setSelectedContact(data[0].contact);
      fetchMessages(data[0].contact);
    }
  };

  const fetchMessages = async (contact) => {
    const res = await fetch(`http://localhost:4000/messages?user1=${username}&user2=${contact}`);
    const data = await res.json();
    setMessages(data);
    setSelectedContact(contact);

    const res2 = await fetch(`http://localhost:4000/contacts/${username}`);
    const contactList = await res2.json();
    setIsFriend(contactList.some(c => c.contact === contact));

    socket.emit('joinRoom', `${username}_${contact}`);
    socket.emit('joinRoom', `${contact}_${username}`);
    socket.emit('markRead', { user1: username, user2: contact });
  };

  const handleSearch = async () => {
    if (!searchName || searchName === username) return;
    const res = await fetch(`http://localhost:4000/user/${searchName}`);
    if (!res.ok) {
      alert('No such user.');
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

  const clearChat = () => {
    socket.emit('clearChat', { user1: username, user2: selectedContact });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    socket.emit('typing', {
      sender: username,
      receiver: selectedContact,
      isTyping: true
    });

    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', {
        sender: username,
        receiver: selectedContact,
        isTyping: false
      });
    }, 1000);
  };

  const handleLogout = () => {
    socket.emit('logout', username);
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const addFriend = async () => {
    if (!selectedContact) return;
    await fetch(`http://localhost:4000/friend/${username}/${selectedContact}`, {
      method: 'POST'
    });
    loadContacts();
    setIsFriend(true);
  };

  return (
    <div className={styles.container}>
      {!maximized && (
        <div className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <h3 className={styles.nametext}>Hi , {username} !</h3>
            <button onClick={handleLogout} className={styles.button}>Logout</button>
          </div>
          <div className={styles.searchBar}>
            <input
              placeholder="Search username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className={styles.inputBox}
            />
            <button onClick={handleSearch} className={styles.button}>Search</button>
          </div>
          <div className={styles.contactList}>
            {contacts.map((c) => (
              <div
                key={c.contact}
                className={`${styles.contactBox} ${selectedContact === c.contact ? styles.selectedContact : ''}`}
                onClick={() => fetchMessages(c.contact)}
              >
                <b>{c.contact}</b> {onlineUsers.includes(c.contact) ?
                  <span className={styles.online}>(online)</span> :
                  <span className={styles.offline}>(offline)</span>}
                <br />
                <small>{c.lastMessage} </small><br />
                <small>{new Date(c.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${styles.chatSection} ${maximized ? styles.maximized : ''}`}>
        {selectedContact && (
          <>
            <div className={styles.chatHeader}>
              <h3 className={styles.nametext}>
                {selectedContact} 
                {onlineUsers.includes(selectedContact) ?
                  <span className={styles.online}> (online)</span> :
                  <span className={styles.offline}> (offline)</span>}
                
              </h3>
              <button onClick={() => setMaximized(!maximized)} className={styles.button}>
                {maximized ? '🗕' : '🗖'}
              </button>
            </div>
            <div className={styles.typingText} >{typing}</div>
          </>
        )}

        <div className={styles.chatBox}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${styles.messageBubble} ${m.sender === username ? styles.sent : styles.received}`}
            >
              <div className={styles.messageContent}>{m.message}</div>
              <div className={styles.messageMeta}>
                <small>{new Date(m.timestamp).toLocaleTimeString()} </small>
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
          />
          <button onClick={sendMessage} className={styles.button}>Send</button>
          <button onClick={clearChat} className={styles.button}>Clear Chat</button>
        </div>
      </div>
    </div>
  );
}