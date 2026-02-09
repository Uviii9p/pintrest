'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import styles from './ChatModal.module.css';
import { X, Send, MessageSquare, Search } from 'lucide-react';

interface ChatModalProps {
    onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
    const { chats, activeChat, setActiveChat, sendMessage, markAsRead, createGroupChat, getJoinCode, joinChatWithCode } = useChat();
    const [messageInput, setMessageInput] = useState('');
    const [groupName, setGroupName] = useState('');
    const [showCreateChat, setShowCreateChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    useEffect(() => {
        if (activeChat) {
            markAsRead(activeChat.id);
        }
    }, [activeChat, markAsRead]);

    const handleCreateGroupChat = () => {
        if (groupName.trim()) {
            createGroupChat(groupName);
            setGroupName('');
            setShowCreateChat(false);
        }
    };

    const handleSendMessage = () => {
        if (messageInput.trim() && activeChat) {
            sendMessage(activeChat.id, messageInput);
            setMessageInput('');
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Messages</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Chat List */}
                    <div className={styles.chatList}>
                        {/* Create Group Chat Button */}
                        <button 
                            className={styles.createChatBtn}
                            onClick={() => setShowCreateChat(!showCreateChat)}
                        >
                            + New Group
                        </button>

                        {/* Create Chat Form */}
                        {showCreateChat && (
                            <div className={styles.createChatForm}>
                                <input
                                    type="text"
                                    placeholder="Group chat name..."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className={styles.groupNameInput}
                                />
                                <button
                                    onClick={handleCreateGroupChat}
                                    disabled={!groupName.trim()}
                                    className={styles.createBtn}
                                >
                                    Create
                                </button>
                            </div>
                        )}

                        {/* Chats List */}
                        <h4 className={styles.chatsHeader}>Your Chats</h4>
                        {chats.length === 0 ? (
                            <p className={styles.noChats}>No chats yet</p>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`${styles.chatItem} ${activeChat?.id === chat.id ? styles.active : ''}`}
                                    onClick={() => setActiveChat(chat.id)}
                                >
                                    <div className={styles.chatInfo}>
                                        <h3>{chat.name}</h3>
                                        <p>{chat.lastMessage || 'No messages yet'}</p>
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className={styles.badge}>{chat.unread}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div className={styles.messagesSection}>
                        {activeChat ? (
                            <>
                                <div className={styles.chatHeader}>
                                    <h3>{activeChat.name}</h3>
                                </div>

                                <div className={styles.messages}>
                                    {activeChat.messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`${styles.message} ${msg.isOwn ? styles.own : styles.other}`}
                                        >
                                            {!msg.isOwn && <div className={styles.senderName}>{msg.sender}</div>}
                                            <div className={styles.messageBubble}>
                                                {msg.message}
                                            </div>
                                            <span className={styles.timestamp}>
                                                {msg.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className={styles.inputArea}>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className={styles.input}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className={styles.sendBtn}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <MessageSquare size={48} />
                                <p>Select a chat to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
