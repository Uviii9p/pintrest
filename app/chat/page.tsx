'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { ArrowLeft, Send, MessageSquare, Copy, Check, Plus, Image, Search, X } from 'lucide-react';
import styles from './ChatPage.module.css';
import type { Pin } from '@/types';

export default function ChatPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { chats, activeChat, setActiveChat, sendMessage, createGroupChat, markAsRead, getJoinCode, joinChatWithCode } = useChat();
    const [messageInput, setMessageInput] = useState('');
    const [showCreateChat, setShowCreateChat] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [showJoinCode, setShowJoinCode] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [showWebSearch, setShowWebSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Pin[]>([]);
    const [searching, setSearching] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    useEffect(() => {
        if (activeChat) {
            console.log('✅ Active chat set:', activeChat.name, 'Code:', activeChat.joinCode);
            markAsRead(activeChat.id);
        }
    }, [activeChat, markAsRead]);

    useEffect(() => {
        console.log('📋 Chats updated:', chats.length, chats.map(c => c.name));
    }, [chats]);

    const handleCreateGroupChat = () => {
        if (groupName.trim()) {
            console.log('Creating group chat:', groupName);
            createGroupChat(groupName);
            setGroupName('');
            setShowCreateChat(false);
            console.log('Chat created, chats count:', chats.length);
        } else {
            console.log('Group name is empty');
        }
    };

    const handleSendMessage = () => {
        if ((messageInput.trim() || selectedMedia) && activeChat) {
            sendMessage(activeChat.id, messageInput, selectedMedia?.url, selectedMedia?.type);
            setMessageInput('');
            setSelectedMedia(null);
        }
    };

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                
                if (isImage || isVideo) {
                    setSelectedMedia({
                        url,
                        type: isImage ? 'image' : 'video',
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWebSearch = async (query: string) => {
        if (!query.trim()) return;

        setSearching(true);
        try {
            const results = await fetch(`/api/pins?q=${encodeURIComponent(query)}`)
                .then(r => r.json())
                .catch(() => []);
            
            setSearchResults(Array.isArray(results) ? results : []);
            console.log(`🔍 Found ${results.length} media results for: ${query}`);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectSearchResult = (pin: Pin) => {
        setSelectedMedia({
            url: pin.image,
            type: pin.type as 'image' | 'video',
        });
        setShowWebSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleCopyJoinCode = () => {
        if (activeChat) {
            const code = getJoinCode(activeChat.id);
            navigator.clipboard.writeText(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleJoinWithCode = () => {
        if (joinChatWithCode(joinCodeInput.toUpperCase())) {
            setJoinCodeInput('');
            setShowJoinCode(false);
            setJoinError('');
        } else {
            setJoinError('Invalid join code. Please try again.');
        }
    };

    if (!user) return null;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.back()}
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className={styles.title}>Messages</h1>
                <div className={styles.placeholder}></div>
            </div>

            <div className={styles.content}>
                {/* Chat List Sidebar */}
                <div className={styles.sidebar}>
                    {/* Create Chat Button */}
                    <button 
                        className={styles.createChatBtn}
                        onClick={() => setShowCreateChat(!showCreateChat)}
                    >
                        <Plus size={18} />
                        New Group Chat
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
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateGroupChat();
                                    }
                                }}
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

                    {/* Join Chat Button */}
                    <button 
                        className={styles.joinChatBtn}
                        onClick={() => setShowJoinCode(!showJoinCode)}
                    >
                        Join with Code
                    </button>

                    {/* Join Chat Form */}
                    {showJoinCode && !activeChat && (
                        <div className={styles.joinCodeForm}>
                            <input
                                type="text"
                                placeholder="Enter join code..."
                                value={joinCodeInput}
                                onChange={(e) => {
                                    setJoinCodeInput(e.target.value.toUpperCase());
                                    setJoinError('');
                                }}
                                className={styles.joinCodeInput}
                            />
                            <button
                                onClick={handleJoinWithCode}
                                className={styles.joinBtn}
                            >
                                Join
                            </button>
                            {joinError && <p className={styles.error}>{joinError}</p>}
                        </div>
                    )}

                    {/* Chats Header */}
                    <h4 className={styles.chatsHeader}>Your Chats ({chats.length})</h4>

                    {/* Chats List */}
                    <div className={styles.chatList}>
                        {chats.length === 0 ? (
                            <p className={styles.noChats}>No chats yet. Create or join one!</p>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`${styles.chatItem} ${activeChat?.id === chat.id ? styles.active : ''}`}
                                    onClick={() => setActiveChat(chat.id)}
                                >
                                    <div className={styles.chatInfo}>
                                        <h3>{chat.name}</h3>
                                        <p className={styles.chatMeta}>
                                            {chat.isGroup ? `👥 ${chat.members.length} members` : '👤 1-on-1'} • {chat.messages.length} messages
                                        </p>
                                        <p className={styles.lastMessage}>{chat.lastMessage ? chat.lastMessage.substring(0, 30) + '...' : 'No messages yet'}</p>
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className={styles.badge}>{chat.unread}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className={styles.messagesSection}>
                    {activeChat ? (
                        <>
                            <div className={styles.chatHeader}>
                                <div className={styles.headerInfo}>
                                    <h3>{activeChat.name}</h3>
                                    <p className={styles.chatMemberInfo}>
                                        {activeChat.isGroup ? `👥 ${activeChat.members.length} members` : '👤 Direct chat'} • Created by {activeChat.createdBy}
                                    </p>
                                    <p className={styles.joinCodeInfo}>
                                        Join Code: <code>{getJoinCode(activeChat.id)}</code>
                                        <button 
                                            className={styles.copyCodeBtn}
                                            onClick={handleCopyJoinCode}
                                            title="Copy join code"
                                        >
                                            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </p>
                                </div>
                            </div>

                            <div className={styles.messages}>
                                {activeChat.messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`${styles.message} ${msg.isOwn ? styles.own : styles.other}`}
                                    >
                                        {!msg.isOwn && <div className={styles.senderName}>{msg.senderUsername}</div>}
                                        <div className={styles.messageBubble}>
                                            {msg.mediaUrl && msg.mediaType === 'image' && (
                                                <img src={msg.mediaUrl} alt="Shared image" className={styles.mediaImage} />
                                            )}
                                            {msg.mediaUrl && msg.mediaType === 'video' && (
                                                <video src={msg.mediaUrl} controls className={styles.mediaVideo} />
                                            )}
                                            {msg.message && <p>{msg.message}</p>}
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

                            {showWebSearch && (
                                <div className={styles.webSearchModal}>
                                    <div className={styles.webSearchHeader}>
                                        <h3>Search for Photos & Videos</h3>
                                        <button
                                            className={styles.closeSearchBtn}
                                            onClick={() => {
                                                setShowWebSearch(false);
                                                setSearchResults([]);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className={styles.webSearchInput}>
                                        <input
                                            type="text"
                                            placeholder="Search for images or videos..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleWebSearch(searchQuery);
                                                }
                                            }}
                                            className={styles.searchInput}
                                        />
                                        <button
                                            onClick={() => handleWebSearch(searchQuery)}
                                            disabled={searching || !searchQuery.trim()}
                                            className={styles.searchSubmitBtn}
                                        >
                                            {searching ? '🔍 Searching...' : 'Search'}
                                        </button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className={styles.webSearchResults}>
                                            {searchResults.slice(0, 6).map((pin) => (
                                                <div
                                                    key={pin.id}
                                                    className={styles.webSearchResult}
                                                    onClick={() => handleSelectSearchResult(pin)}
                                                >
                                                    <img 
                                                        src={pin.image} 
                                                        alt={pin.title}
                                                        className={styles.webSearchImage}
                                                    />
                                                    <div className={styles.webSearchOverlay}>
                                                        <span>{pin.type === 'video' ? '▶️ Video' : '📷 Image'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedMedia && (
                                <div className={styles.mediaPreview}>
                                    <div className={styles.mediaPreviewContent}>
                                        {selectedMedia.type === 'image' && (
                                            <img src={selectedMedia.url} alt="Preview" className={styles.previewImage} />
                                        )}
                                        {selectedMedia.type === 'video' && (
                                            <video src={selectedMedia.url} className={styles.previewVideo} />
                                        )}
                                        <button
                                            className={styles.clearMediaBtn}
                                            onClick={() => setSelectedMedia(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={styles.inputArea}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleMediaSelect}
                                    accept="image/*,video/*"
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className={styles.mediaBtn}
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Share photo or video from device"
                                >
                                    <Image size={18} />
                                </button>
                                <button
                                    className={styles.searchBtn}
                                    onClick={() => setShowWebSearch(!showWebSearch)}
                                    title="Search for photos/videos online"
                                >
                                    <Search size={18} />
                                </button>
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
                                    disabled={!messageInput.trim() && !selectedMedia}
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
                            <p className={styles.emptyMessage}>
                                Create a new group chat or join one using a code
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
