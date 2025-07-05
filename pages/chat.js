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
  const [taggedMsg, setTaggedMsg] = useState(null);

  const chatBoxRef = useRef(null);
  const typingTimeout = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toDateString();
  };

  const fetchMessages = useCallback(async (contact) => {
    try {
      const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/messages?user1=${username}&user2=${contact}`);
      const data = await res.json();
      setMessages(data);
      setSelectedContact(contact);
      setMaximized(true);
      socket.emit('joinRoom', `${username}_${contact}`);
      socket.emit('joinRoom', `${contact}_${username}`);
      socket.emit('markRead', { user1: username, user2: contact });
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    }
  }, [username]);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) router.replace('/login');
    else {
      setUsername(user);
      socket.emit('login', user);
      if (user === 'aniketadmin') router.push('/admin');
    }
  }, [router]);

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
    if (!res.ok) return;
    fetchMessages(searchName);
    setSearchName('');
  };

  const sendMessage = () => {
    if (!message || !selectedContact) return;
    socket.emit('sendMessage', {
      sender: username,
      receiver: selectedContact,
      message,
      tag: taggedMsg || null,
      room: `${username}_${selectedContact}`
    });
    setMessage('');
    setTaggedMsg(null);
    socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
  };
  
  const clearChat = () => {
    if (username !== 'aniketadmin') socket.emit('clearChat', { user1: username, user2: selectedContact });
  };

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

  const handleTag = (msg) => setTaggedMsg(msg);

  const scrollToMessage = (content) => {
    const el = document.querySelector(`[data-msg='${content}']`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add(styles.highlightOnce);
      setTimeout(() => el.classList.remove(styles.highlightOnce), 1500);
    }
  };

  const groupedMessages = [];
  let lastDate = '';
  for (let msg of messages) {
    const dateLabel = formatDate(msg.timestamp);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'date', label: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: 'msg', data: msg });
  }

  return (
    <div className={styles.container}>
      {!maximized && (
        <div className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <h3>Hi, {username}</h3>
            <button onClick={handleLogout} className={styles.button}>Logout</button>
            {username === 'aniketadmin' && (
              <button onClick={() => router.push('/admin')} className={styles.button}>Admin Panel</button>
            )}
          </div>
          <div className={styles.searchBar}>
            <input
              placeholder="Search username"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className={styles.inputBox}
            />
            <button onClick={handleSearch} className={styles.button}>Search</button>
          </div>
        </div>
      )}

      {selectedContact && (
        <div className={`${styles.chatSection} ${maximized ? styles.maximized : ''}`}>
          <div className={styles.chatHeader}>
            <button onClick={() => window.location.reload()} className={styles.button}>⬅</button>
            <h3>{selectedContact} {onlineUsers.includes(selectedContact) ? '(online)' : '(offline)'}</h3>
            {username !== 'aniketadmin' && (
              <button onClick={clearChat} className={styles.button}>Clear Chat</button>
            )}
          </div>

          <div className={styles.typingText}>{typing}</div>

          <div className={styles.chatBox} ref={chatBoxRef}>
            {groupedMessages.map((item, i) =>
              item.type === 'date' ? (
                <div key={`date-${i}`} className={styles.dateLabel}>{item.label}</div>
              ) : (
                <div
                  key={i}
                  data-msg={item.data.message}
                  className={`${styles.messageBubble} ${item.data.sender === username ? styles.sent : styles.received}`}
                  onDoubleClick={() => handleTag(item.data.message)}
                >
                  {item.data.tag && (
                    <div className={styles.tagPreview} onClick={() => scrollToMessage(item.data.tag)}>
                       {item.data.tag.length > 40 ? item.data.tag.slice(0, 40) + '...' : item.data.tag}
                    </div>
                  )}
                  <div className={styles.messageContent}>{item.data.message}</div>
                  <div className={styles.messageMeta}>
                    <small>{new Date(item.data.timestamp).toLocaleTimeString()} {item.data.sender === username ? (item.data.read ? '✓✓' : '✓') : ''}</small>
                  </div>
                </div>
              )
            )}
          </div>

          <div className={styles.inputSection}>
            {taggedMsg && (
              <div className={styles.tagBox}> {taggedMsg.length > 40 ? taggedMsg.slice(0, 40) + '...' : taggedMsg} <span onClick={() => setTaggedMsg(null)}>❌</span></div>
            )}
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
