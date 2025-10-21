import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import styles from '../styles/chat.module.css';
import emailjs from "@emailjs/browser";

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
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  // new state: lastSeen of selected contact
  const [lastSeen, setLastSeen] = useState(null);

  // reaction UI state
  const [reactionPopup, setReactionPopup] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null
  });
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [enlargedReaction, setEnlargedReaction] = useState({ visible: false, x: 0, y: 0, reactionEmoji: null, messageId: null });

  // context menu (delete/edit) state (appears under message)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null
  });

  // editing state: when non-null, it holds the messageId being edited (_id) and original text
  const [editingMessage, setEditingMessage] = useState({
    messageId: null,
    originalText: ''
  });

  const chatBoxRef = useRef(null);
  const typingTimeout = useRef(null);
  const longPressTimer = useRef(null);
  const longPressTarget = useRef(null);
  const router = useRouter();

  const defaultEmojis = ['👍', '❤️', '😊' ,'🙈', '🤐' , '👋' , '😭']; 

  // EmailJS configuration (provided)
  const EMAILJS_SERVICE_ID = 'service_zvy2vyl';
  const EMAILJS_TEMPLATE_ID = 'template_nf9pz38';
  const EMAILJS_PUBLIC_KEY = 'XvXZ1noU8RGPNrKQB';
  // NOTE: private keys should not be used client-side. The public key is what EmailJS expects for client calls.

  // ------------------ WATCH CONFIG (changeable) ------------------
  // This is the username to watch. Change to 'flora' or another username to test.
  const checkForUser = 'flora';

  // client-side safeguard: avoid double-sending email if server incorrectly emits duplicates
  const alertedRef = useRef({}); // username -> boolean

  // clamp popup coordinates inside the chatBox to avoid escaping the UI
  const clampCoordsToChatBox = (x, y) => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) {
      // fallback to viewport clamp
      const margin = 12;
      const clampedX = Math.max(margin, Math.min(window.innerWidth - margin, x));
      const clampedY = Math.max(margin, Math.min(window.innerHeight - margin, y));
      return { x: clampedX, y: clampedY };
    }

    const rect = chatBox.getBoundingClientRect();
    const margin = 10;

    // horizontal clamping
    const leftBound = rect.left + margin;
    const rightBound = rect.right - margin;

    // vertical clamping (avoid behind header)
    const topBound = rect.top + margin + 30;
    const bottomBound = rect.bottom - margin - 20;

    const clampedX = Math.max(leftBound, Math.min(rightBound, x));
    const clampedY = Math.max(topBound, Math.min(bottomBound, y));

    return { x: clampedX, y: clampedY };
  };

  const scrollToBottom = (force = false) => {
    if (!chatBoxRef.current) return;
    const chatBox = chatBoxRef.current;
    const distanceFromBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;

    if (force) {
      setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 100);
    } else {
      // if user is near bottom, keep them at bottom
      if (distanceFromBottom < 80) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
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

  // --- tiny helper: convert plain-text URLs to clickable <a> elements ---
  const linkify = (text) => {
    if (text === null || text === undefined) return null;
    // split and keep URLs
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) => {
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const fetchMessages = useCallback(async (contact, forceScroll = false) => {
    try {
      const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/messages?user1=${username}&user2=${contact}`);
      const newData = await res.json();

      // ensure each message has reactions array (compatibility)
      const normalized = newData.map(m => ({ ...m, reactions: m.reactions || [] }));

      setMessages(prev => {
        if (prev.length !== normalized.length) return normalized;

        let changed = false;

        const updated = prev.map((oldMsg, i) => {
          const newMsg = normalized[i];

          if (oldMsg.read !== newMsg.read) {
            changed = true;
            return { ...oldMsg, read: newMsg.read, reactions: newMsg.reactions || [] };
          }
          // also ensure reactions updates are detected
          const oldReacts = JSON.stringify(oldMsg.reactions || []);
          const newReacts = JSON.stringify(newMsg.reactions || []);
          if (oldReacts !== newReacts) {
            changed = true;
            return { ...oldMsg, reactions: newMsg.reactions || [] };
          }

          // detect edited/deleted changes
          if ((oldMsg.edited !== newMsg.edited) || (oldMsg.deleted !== newMsg.deleted) || (oldMsg.message !== newMsg.message)) {
            changed = true;
            return { ...oldMsg, ...newMsg };
          }

          return oldMsg;
        });

        return changed ? updated : prev;
      });

      if (forceScroll) scrollToBottom(true);

      setSelectedContact(contact);
      setMaximized(true);
      socket.emit('joinRoom', `${username}_${contact}`);
      socket.emit('joinRoom', `${contact}_${username}`);
      socket.emit('markRead', { user1: username, user2: contact });
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    }
  }, [username, isUserAtBottom]);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) router.replace('/login');
    setUsername(user);
    socket.emit('login', user);

    if (user === 'aniketadmin') return router.push('/admin');
  }, [router]);

  useEffect(() => {
    if (username === 'ditto') fetchMessages('flora', true);
    else if (username === 'flora') fetchMessages('ditto', true);
  }, [username]);

  useEffect(() => {
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);

  useEffect(() => {
    // socket events
    socket.on('onlineUsers', (users) => setOnlineUsers(users));

    socket.on('newMessage', (msg) => {
      // ensure reactions field exists
      msg.reactions = msg.reactions || [];
      if (selectedContact && (msg.sender === selectedContact || msg.receiver === selectedContact)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom(msg.sender === username); // Only force-scroll if YOU sent it
      }
    });

    socket.on('typing', ({ sender, isTyping }) => {
      if (sender === selectedContact) setTyping(isTyping ? `${sender} is typing...` : '');
    });

    socket.on('cleared', () => setMessages([]));

    socket.on('refresh', () => {
      if (selectedContact) fetchMessages(selectedContact, false); // No force scroll!
    });

    // ====== IMPORTANT: listen to messageUpdated (backend emits this after reaction change, edit, delete) ======
    socket.on('messageUpdated', (updatedMsg) => {
      // ensure reactions exist
      updatedMsg.reactions = updatedMsg.reactions || [];

      setMessages(prev => {
        // find index of message by _id (prefer) or by synthetic id fallback
        const idx = prev.findIndex(m => (m._id && updatedMsg._id && m._id === updatedMsg._id) || (m._id === updatedMsg._id));
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...updatedMsg };
          return copy;
        } else {
          // if message not present, append (rare)
          return [...prev, updatedMsg];
        }
      });

      // if the updated message is the one we're editing and got changed by backend,
      // we should clear edit state
      if (editingMessage.messageId && updatedMsg._id && editingMessage.messageId === updatedMsg._id) {
        setEditingMessage({ messageId: null, originalText: '' });
        setMessage('');
      }
    });

    // ---- NEW: listen for server alert that a watched user came online ----
    socket.on('userOnlineAlert', (payload) => {
      // payload: { username: 'aaa' }
      if (!payload || !payload.username) return;
      if (payload.username !== checkForUser) return;

      // avoid duplicate sends on client-side in case of duplicate events
      if (alertedRef.current[payload.username]) return;
      alertedRef.current[payload.username] = true;

      // prepare template params (you already provided these ids on client)
      const templateParams = {
        to_name: payload.username,
        from_name: username || 'Unknown',
        message: `${payload.username} is now ONLINE (alert triggered) — detected at ${new Date().toLocaleString()}`
      };

      // send email via EmailJS (uses your same service/template/public key)
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
        .then(() => {
          // quick, visible feedback for dev/testing — can be removed later
          alert(`Email sent: ${payload.username} is online`);
        })
        .catch((err) => {
          console.error('EmailJS send error (from userOnlineAlert):', err);
          // still mark as alerted to avoid retry spam; server controls re-alert when user goes offline/online again
        });
    });

    return () => {
      socket.off('onlineUsers');
      socket.off('newMessage');
      socket.off('typing');
      socket.off('cleared');
      socket.off('refresh');
      socket.off('messageUpdated');
      socket.off('userOnlineAlert');
    };
  }, [selectedContact, fetchMessages, username, editingMessage.messageId]);

  // fetch lastSeen for selected contact whenever selection or online status changes
  useEffect(() => {
    let mounted = true;
    const getLastSeen = async () => {
      if (!selectedContact) {
        if (mounted) setLastSeen(null);
        return;
      }

      try {
        const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/user/${selectedContact}`);
        if (!res.ok) {
          if (mounted) setLastSeen(null);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        // backend returns lastSeen as ISO string or null
        setLastSeen(data.lastSeen ? new Date(data.lastSeen) : null);
      } catch (err) {
        if (mounted) setLastSeen(null);
      }
    };

    getLastSeen();

    return () => { mounted = false; };
  }, [selectedContact, onlineUsers]);

  const formatLastSeen = (d) => {
    if (!d) return null;
    const now = new Date();
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const yesterday = new Date(todayOnly);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return `Last seen today at ${d.toLocaleTimeString()}`;
    }
    if (dateOnly.getTime() === yesterday.getTime()) {
      return `Last seen yesterday at ${d.toLocaleTimeString()}`;
    }
    return `Last seen ${d.toLocaleString()}`;
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

      // Clear session before redirect
      localStorage.removeItem('username');

      setTimeout(() => {
        window.location.href = link;
      }, 500);
    }
  };

  const handleSearch = async () => {
    if (!searchName || searchName === username) return;
    const res = await fetch(`https://mychatappbackend-zzhh.onrender.com/user/${searchName}`);
    if (!res.ok) return;
    fetchMessages(searchName, true); // Force scroll when opening a chat
    setSearchName('');
  };

  // sendMessage now supports both creating a new message and finalizing an edit
  const sendMessage = () => {
    if (!message || !selectedContact) return;

    // If currently editing a message, emit editMessage (do not create a new message)
    if (editingMessage.messageId) {
      // find message object to ensure _id present
      const msgObj = messages.find(m => m._id === editingMessage.messageId);
      if (!msgObj || !msgObj._id) {
        // can't edit if original message has no valid _id
        // fallback: do nothing (preserve input)
        return;
      }
      socket.emit('editMessage', {
        messageId: editingMessage.messageId,
        user: username,
        newText: message,
        room: `${username}_${selectedContact}`
      });

      // optimistic UI update: update local message text and mark edited (will be reconciled by server)
      setMessages(prev => prev.map(m => (m._id === editingMessage.messageId ? { ...m, message, edited: true } : m)));

      // clear editing state
      setEditingMessage({ messageId: null, originalText: '' });
      setMessage('');
      socket.emit('typing', { sender: username, receiver: selectedContact, isTyping: false });
      return;
    }

    // normal send
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

  // helper to get stable id for message (use _id if present)
  const getMsgId = (msg) => msg._id || `${msg.sender}_${msg.timestamp}`;

  // ---- Reactions logic ----

  // Open reaction popup for a message (long-press trigger)
  const openReactionPopup = (messageId, clientX, clientY) => {
    // small offsets so it doesn't obstruct
    setEmojiPickerOpen(false);
    // clamp coords so popup doesn't go outside chat area
    const { x, y } = clampCoordsToChatBox(clientX, clientY);

    // Reaction popup should appear above the message (translateY in render)
    setReactionPopup({
      visible: true,
      x,
      y,
      messageId
    });

    // Context menu should appear slightly below the message
    const menuY = y + 40; // a bit lower
    setContextMenu({
      visible: true,
      x,
      y: menuY,
      messageId
    });
  };

  const closeReactionPopup = () => {
    setReactionPopup({ visible: false, x: 0, y: 0, messageId: null });
    setEmojiPickerOpen(false);
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen(v => !v);
  };

  // handle selecting an emoji from popup
  const onSelectEmoji = (emoji, messageId) => {
    // optimistic UI update:
    setMessages(prev => prev.map(m => {
      const id = getMsgId(m);
      if (id !== messageId && m._id !== messageId) return m;
      const existing = m.reactions || [];

      // find existing reaction by current user (single reaction per user)
      const userReactionIndex = existing.findIndex(r => r.username === username || r.user === username);

      if (userReactionIndex !== -1) {
        const userReaction = existing[userReactionIndex];
        if (userReaction.emoji === emoji) {
          // remove reaction (toggle off)
          const updated = [...existing.slice(0, userReactionIndex), ...existing.slice(userReactionIndex + 1)];
          return { ...m, reactions: updated };
        } else {
          // replace their emoji
          const updated = [...existing];
          // normalize reaction object to use 'user' property expected by backend
          updated[userReactionIndex] = { user: username, emoji };
          return { ...m, reactions: updated };
        }
      } else {
        // add reaction
        return { ...m, reactions: [...existing, { user: username, emoji }] };
      }
    }));

    // emit to server for persistence — prefer to send the real Mongo _id if available
    const msgObj = messages.find(m => getMsgId(m) === messageId || m._id === messageId);
    const sendId = (msgObj && msgObj._id) ? msgObj._id : messageId;

    socket.emit('addReaction', { messageId: sendId, user: username, emoji, room: `${username}_${selectedContact}` });

    // close popup after selection (small delay so user sees feedback)
    setTimeout(closeReactionPopup, 150);
  };

  // clicking small reaction badge under message
  const onClickReactionBadge = (messageId, emoji) => {
    // check if current user has this emoji on this message
    const msg = messages.find(m => getMsgId(m) === messageId || m._id === messageId);
    if (!msg) return;
    const existing = msg.reactions || [];
    const userReact = existing.find(r => r.username === username || r.user === username);

    if (userReact && userReact.emoji === emoji) {
      // current user clicked their own reaction -> remove (toggle)
      onSelectEmoji(emoji, msg._id || messageId); // onSelectEmoji toggles/remove if same emoji
      return;
    }

    // else show enlarged reaction view at center of viewport (consistent UX)
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    setEnlargedReaction({ visible: true, x, y, reactionEmoji: emoji, messageId: msg._id || messageId });
  };

  const closeEnlargedReaction = () => setEnlargedReaction({ visible: false, x: 0, y: 0, reactionEmoji: null, messageId: null });

  // outside click handler to close popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      // if click on reaction popup or emoji picker -> do nothing
      const rp = document.getElementById('reaction-popup');
      const ep = document.getElementById('emoji-picker-popup');
      const cm = document.getElementById('context-menu-popup');
      if (rp && rp.contains(e.target)) return;
      if (ep && ep.contains(e.target)) return;
      if (cm && cm.contains(e.target)) return;

      closeReactionPopup();
      closeEnlargedReaction();
      closeContextMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Long press handlers (works for mouse & touch)
  const onMsgPointerDown = (e, message) => {
    // only open popup if a contact is selected
    if (!selectedContact) return;
    // store a target id so we know which message
    const messageId = getMsgId(message);
    longPressTarget.current = messageId;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // start timer (600ms)
    longPressTimer.current = setTimeout(() => {
      openReactionPopup(messageId, clientX, clientY);
    }, 600);
  };

  const onMsgPointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // scroll behaviour: show floating button when not at bottom
  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setIsUserAtBottom(Math.abs(distance) < 20);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // function to manually scroll to bottom and hide button
  const scrollToBottomButton = () => {
    if (!chatBoxRef.current) return;
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    setIsUserAtBottom(true);
    // tiny timeout to ensure UI updates
    setTimeout(() => {
      setIsUserAtBottom(true);
    }, 200);
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

  // helper: count reactions by emoji and whether current user reacted
  const reactionSummary = (m) => {
    const reactions = m.reactions || [];
    const map = {};
    reactions.forEach(r => {
      const usernameKey = r.username || r.user || '';
      map[r.emoji] = map[r.emoji] || { count: 0, users: [] };
      map[r.emoji].count += 1;
      map[r.emoji].users.push(usernameKey);
    });
    return map; // { '👍': {count:2, users:['a','b']}, ...}
  };

  // Delete message handler (both sender or receiver)
  const handleDeleteMessage = (messageId) => {
    // find message in state to get real _id if present
    const msgObj = messages.find(m => getMsgId(m) === messageId || m._id === messageId);
    const sendId = (msgObj && msgObj._id) ? msgObj._id : messageId;
    if (!sendId) return;

    // who is requesting delete: username
    const deleter = username;

    // optimistic update: mark deleted locally
    setMessages(prev => prev.map(m => {
      if (m._id === sendId || getMsgId(m) === messageId) {
        return { ...m, deleted: true, deletedBy: deleter, message: `${deleter} deleted this message` };
      }
      return m;
    }));

    // emit to server
    socket.emit('deleteMessage', { messageId: sendId, user: deleter, room: `${username}_${selectedContact}` });

    // close context menu
    closeContextMenu();
    closeReactionPopup();
  };

  // Edit message handler (only sender)
  const handleStartEditMessage = (messageId) => {
    // find message
    const msgObj = messages.find(m => getMsgId(m) === messageId || m._id === messageId);
    const sendId = (msgObj && msgObj._id) ? msgObj._id : messageId;
    if (!msgObj || !sendId) return;

    // only sender can edit
    if (msgObj.sender !== username) {
      // unauthorized - do nothing
      closeContextMenu();
      return;
    }

    // open editing: put text into input and set editingMessage state
    setEditingMessage({ messageId: sendId, originalText: msgObj.message || '' });
    setMessage(msgObj.message || '');
    // focus the input element if present
    const inputEl = document.querySelector(`.${styles.inputBox}`);
    if (inputEl) inputEl.focus();

    // close context menu & reaction popup
    closeContextMenu();
    closeReactionPopup();
  };

  // cancel editing
  const cancelEdit = () => {
    setEditingMessage({ messageId: null, originalText: '' });
    setMessage('');
  };

  // ---- New: handle status-dot click (only when chat is with 'ditto') ----
  const handleStatusDotClick = async () => {
    if (!selectedContact) return;
    // only allow action when chat target is 'ditto' (exact match)
    if (selectedContact !== 'ditto') return;

    // prepare template params respecting typical EmailJS fields:
    const templateParams = {
      to_name: selectedContact, // "whome"
      from_name: username || 'Unknown', // "by whome"
      message: `${username || 'Someone'} clicked the status dot for ${selectedContact} on ${new Date().toLocaleString()}` // "what will be the message"
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      // quick UI feedback
      alert('Notification sent via EmailJS.');
    } catch (err) {
      console.error('EmailJS send error:', err);
      alert('Failed to send notification (EmailJS).');
    }
  };

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

            {/* Modified header to keep exact behavior but make dot clickable when chatting with 'ditto' */}
            <h3 className={styles.idstatus} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{selectedContact}</span>

              {/* If the selected contact is 'ditto', render a pressable button (for ANY user who opened ditto chat).
                  Otherwise show simple status text like before. */}
              {selectedContact === 'ditto' ? (
                <button
                  onClick={handleStatusDotClick}
                  title="Press to notify via EmailJS"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    background: onlineUsers.includes(selectedContact) ? '#2ecc71' : '#e74c3c',
                    color: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  {onlineUsers.includes(selectedContact) ? '🟢' : '🔴'}
                </button>
              ) : (
                <span style={{ fontSize: '0.95rem' }}>{onlineUsers.includes(selectedContact) ? '(🟢)' : '(🔴)'}</span>
              )}
            </h3>

            {/* show last seen (when not online) */}
            {!onlineUsers.includes(selectedContact) && lastSeen && (
              <div style={{ fontSize: '0.85rem', color: '#bbb', marginLeft: 10 }}>{formatLastSeen(lastSeen)}</div>
            )}

            {['ditto', 'flora'].includes(username) && (
              <>
                <button onClick={handleDrive} className={styles.button}><b>DRIVE</b></button>
                <button onClick={handleRedirect} className={styles.button}><b>REDIRECT</b></button>
              </>
            )}

            {username !== 'aniketadmin' && (
              <button onClick={clearChat} className={styles.button}>Clear Chat</button>
            )}
          </div>

          <div className={styles.typingText}>{typing}</div>

          <div
            className={styles.chatBox}
            ref={chatBoxRef}
            onScroll={() => {
              if (!chatBoxRef.current) return;
              const el = chatBoxRef.current;
              const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
              setIsUserAtBottom(Math.abs(distance) < 20); // ← more accurate
            }}
          >
            {groupedMessages.map((item, i) =>
              item.type === 'date' ? (
                <div key={`date-${i}`} className={styles.dateLabel}>{item.label}</div>
              ) : (
                (() => {
                  const m = item.data;
                  const mid = getMsgId(m);
                  const reactMap = reactionSummary(m);
                  const sortedReacts = Object.keys(reactMap); // order not important
                  const userReact = (m.reactions || []).find(r => (r.username === username || r.user === username));

                  // if message is marked deleted, show placeholder and disable edit & tag & long-press actions
                  const isDeleted = !!m.deleted;
                  const isEdited = !!m.edited;

                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === username ? 'flex-end' : 'flex-start' }}>
                      <div
                        data-msg={m.message}
                        className={`${styles.messageBubble} ${m.sender === username ? styles.sent : styles.received} ${isDeleted ? styles.deletedMessage : ''}`}
                        onDoubleClick={() => { if (!isDeleted) handleTag(m.message); }}
                        // long-press handlers:
                        onMouseDown={(e) => { if (!isDeleted) onMsgPointerDown(e, m); }}
                        onMouseUp={onMsgPointerUp}
                        onMouseLeave={onMsgPointerUp}
                        onTouchStart={(e) => { if (!isDeleted) onMsgPointerDown(e, m); }}
                        onTouchEnd={onMsgPointerUp}
                      >
                        {m.tag && (
                          <div className={styles.tagPreview} onClick={() => scrollToMessage(m.tag)}>
                            {m.tag.length > 40 ? m.tag.slice(0, 40) + '...' : m.tag}
                          </div>
                        )}
                        {/* message content */}
                        <div className={styles.messageContent}>
                          {/* If deleted, show explicit deleted text */}
                          {isDeleted ? (
                            <em>{m.message || `${m.deletedBy || 'Someone'} deleted this message`}</em>
                          ) : (
                            linkify(m.message)
                          )}
                        </div>
                        <div className={styles.messageMeta}>
                          <small>
                            {new Date(m.timestamp).toLocaleTimeString()}
                            {m.sender === username ? (m.read ? ' ✓✓' : ' ✓') : ''}
                            {isEdited && !isDeleted ? ' (edited)' : ''}
                          </small>
                        </div>
                      </div>

                      {/* reactions bar under each message */}
                      {sortedReacts.length > 0 && !isDeleted && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                          {sortedReacts.map((emoji) => {
                            const info = reactMap[emoji];
                            const youReacted = info.users.includes(username);
                            return (
                              <div
                                key={emoji}
                                className={`reaction-badge ${youReacted ? 'you-reacted' : ''}`}
                                onClick={() => onClickReactionBadge(mid, emoji)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '4px 6px',
                                  borderRadius: 16,
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
                                title={info.users.join(', ')}
                              >
                                <span style={{ fontSize: 14 }}>{emoji}</span>
                                <span style={{ fontSize: 12 }}>{info.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()
              )
            )}
          </div>

          {/* Reaction popup (quick emojis + plus) */}
          {reactionPopup.visible && (
            <div
              id="reaction-popup"
              style={{
                position: 'fixed',
                left: reactionPopup.x,
                top: reactionPopup.y,
                transform: 'translate(-50%, -120%)',
                zIndex: 9999
              }}
            >
              <div className="reaction-popup-inner">
                {defaultEmojis.map((e) => (
                  <button
                    key={e}
                    className="reaction-emoji-btn"
                    onClick={() => onSelectEmoji(e, reactionPopup.messageId)}
                  >
                    {e}
                  </button>
                ))}
                <button
                  className="reaction-emoji-btn plus-btn"
                  onClick={() => {
                    setEmojiPickerOpen(true);
                  }}
                >
                  ➕
                </button>
              </div>
            </div>
          )}

          {/* Context menu (delete / edit) shown under message */}
          {contextMenu.visible && (
            <div
              id="context-menu-popup"
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                transform: 'translate(-50%, 0)',
                zIndex: 9999,
                background: '#fff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                borderRadius: 8,
                padding: 8,
                minWidth: 160
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  className={styles.button}
                  onClick={() => handleDeleteMessage(contextMenu.messageId)}
                >
                  Delete
                </button>
                {/* Edit button only visible if current user is the sender of that message */}
                {(() => {
                  const msgObj = messages.find(m => getMsgId(m) === contextMenu.messageId || m._id === contextMenu.messageId);
                  if (msgObj && msgObj.sender === username && !msgObj.deleted) {
                    return (
                      <button
                        className={styles.button}
                        onClick={() => handleStartEditMessage(contextMenu.messageId)}
                      >
                        Edit
                      </button>
                    );
                  }
                  return null;
                })()}
               
              </div>
            </div>
          )}

          {/* Emoji picker popup (simple grid) */}
          {emojiPickerOpen && reactionPopup.visible && (
            <div
              id="emoji-picker-popup"
              style={{
                position: 'fixed',
                left: reactionPopup.x,
                top: reactionPopup.y - 60,
                transform: 'translate(-50%, -220%)',
                zIndex: 10000,
                padding: 8,
                borderRadius: 8,
                boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                background: '#fff',
                maxWidth: '90vw',
                maxHeight: '45vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 28px)', gap: 6 }}>
                {/* minimal emoji set - you can expand */}
                {['👍', '❤️', '😂', '😅',  '😴', '😎', '🤝', '😡', '👀'].map(e => (
                  <button key={e} className="emoji-picker-btn" onClick={() => onSelectEmoji(e, reactionPopup.messageId)}>{e}</button>
                ))}
              </div>
            </div>
          )}

          {/* Enlarged reaction popup (when clicking someone else's reaction) */}
          {enlargedReaction.visible && (
            <div
              style={{
                position: 'fixed',
                left: enlargedReaction.x,
                top: enlargedReaction.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 10001,
                background: '#111',
                color: '#fff',
                padding: 10,
                borderRadius: 8
              }}
            >
              <div style={{ fontSize: 28 }}>{enlargedReaction.reactionEmoji}</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                {/* show list of users who reacted with this emoji (if message present) */}
                {(() => {
                  const msg = messages.find(m => getMsgId(m) === enlargedReaction.messageId || m._id === enlargedReaction.messageId);
                  if (!msg) return null;
                  const users = (msg.reactions || []).filter(r => r.emoji === enlargedReaction.reactionEmoji).map(r => r.username || r.user);
                  return <div>{users.join(', ')}</div>;
                })()}
              </div>
              <div style={{ marginTop: 8, textAlign: 'right' }}> <p>was reacted</p>
                <button className={styles.button} onClick={closeEnlargedReaction}>Close</button>
              </div>
            </div>
          )}

          {taggedMsg && (
            <div className={styles.tagBoxWrapper}>
              <div className={styles.tagBoxinput}>
                <span onClick={() => setTaggedMsg(null)} className={styles.tagClose}>❌</span>
                {taggedMsg.length > 80 ? taggedMsg.slice(0, 80) + '...' : taggedMsg}
              </div>
            </div>
          )}

          {/* If editing, show a small editing bar above input */}
          {editingMessage.messageId && (
            <div style={{ padding: '6px 10px', background: '#222', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, fontSize: 14 }}>Editing message</div>
              <button className={styles.button} onClick={cancelEdit}>Cancel</button>
            </div>
          )}

          <div className={styles.inputSection}>
            <input
              value={message}
              onChange={handleTyping}
              placeholder="Type..."
              className={styles.inputBox}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} className={styles.button}>{editingMessage.messageId ? 'Save' : 'Send'}</button>
          </div>

          {/* floating scroll-to-bottom button */}
          {!isUserAtBottom && (
            <button
              aria-label="scroll-to-bottom"
              onClick={scrollToBottomButton}
              style={{
                position: 'fixed',
                right: 24,
                bottom: 90,
                zIndex: 999,
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                border: 'none',
                background: '#942727',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ↓
            </button>
          )}

        </div>
      )}
    </div>
  );
}
