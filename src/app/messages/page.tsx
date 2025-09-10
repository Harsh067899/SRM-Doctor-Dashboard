'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, MoreHorizontal, User as UserIcon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getAllUsers, sendMessageToUser, subscribeToUserChats } from '@/lib/firestore';
import { User as UserType, ChatMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const usersListRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const doctorId = 'doctor_1'; // In a real app, this would come from authentication

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setShouldAutoScroll(true); // Reset auto-scroll when selecting a new user
      const unsubscribe = subscribeToUserChats(selectedUser.id, (chatMessages) => {
        setMessages(chatMessages.reverse());
      });
      return () => unsubscribe();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      if (allUsers.length > 0) {
        setSelectedUser(allUsers[0]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    // Scroll the selected user into view
    setTimeout(() => {
      const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
      if (userElement && usersListRef.current) {
        userElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await sendMessageToUser(selectedUser.id, newMessage, doctorId);
      setNewMessage('');
      setShouldAutoScroll(true); // Auto-scroll when user sends a message
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="header">
        <h1>Messages</h1>
        <p>Communicate with parents and provide guidance.</p>
      </div>

      <div className="messages-container">
        {/* Users List */}
        <div className="users-sidebar">
          <div className="users-search">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-list" ref={usersListRef}>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <UserIcon size={32} className="empty-icon" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  data-user-id={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'user-item-active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-avatar">
                    <UserIcon size={20} />
                  </div>
                  <div className="user-info">
                    <h4 className="user-name">{user.name}</h4>
                    <p className="user-phone">{user.phone_number}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    <UserIcon size={20} />
                    <div className="online-indicator"></div>
                  </div>
                  <div className="chat-user-details">
                    <h3 className="chat-user-name">{selectedUser.name}</h3>
                    <p className="chat-user-status">Online</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-btn" title="Voice Call">
                    <Phone size={16} />
                  </button>
                  <button className="chat-action-btn" title="Video Call">
                    <Video size={16} />
                  </button>
                  <button className="chat-action-btn" title="More Options">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area" ref={messagesAreaRef} onScroll={handleScroll}>
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">
                      <Send size={32} />
                    </div>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender_type === 'doctor' ? 'message-sent' : 'message-received'}`}>
                      <div className="message-bubble">
                        <p className="message-text">{message.message}</p>
                        <p className="message-time">
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()} 
                    className={`send-button ${!newMessage.trim() ? 'send-button-disabled' : ''}`}
                    title="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-user-selected">
              <div className="no-user-content">
                <UserIcon size={48} className="no-user-icon" />
                <h3>Select a User</h3>
                <p>Choose a user from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
