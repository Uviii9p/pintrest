'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ChatMessage {
    id: string;
    sender: string;
    senderUsername: string;
    message: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    timestamp: Date;
    isOwn: boolean;
}

export interface Chat {
    id: string;
    name: string;
    messages: ChatMessage[];
    lastMessage?: string;
    lastTimestamp?: Date;
    unread: number;
    joinCode: string;
    createdBy: string; // Username who created chat
    isGroup: boolean;
    members: string[]; // List of member usernames
}

interface StoredChat extends Omit<Chat, 'messages' | 'lastTimestamp'> {
    messages: Omit<ChatMessage, 'timestamp'>[];
    lastTimestamp?: string;
}

interface ChatContextType {
    chats: Chat[];
    activeChat: Chat | null;
    setActiveChat: (chatId: string) => void;
    sendMessage: (chatId: string, message: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
    createGroupChat: (groupName: string) => void;
    markAsRead: (chatId: string) => void;
    getJoinCode: (chatId: string) => string;
    joinChatWithCode: (joinCode: string) => boolean;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

/**
 * Generate a unique 6-character join code
 */
function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Get storage key for user's chats
 */
function getUserChatsKey(userId: string): string {
    return `chats_${userId}`;
}

/**
 * Global key for join code registry
 */
function getJoinCodeRegistryKey(): string {
    return 'chat_join_codes';
}

interface JoinCodeRegistry {
    [code: string]: {
        chatId: string;
        createdBy: string;
        chatName: string;
    };
}

/**
 * Get join code registry from localStorage
 */
function getJoinCodeRegistry(): JoinCodeRegistry {
    try {
        const stored = localStorage.getItem(getJoinCodeRegistryKey());
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error('Failed to load join code registry', e);
        return {};
    }
}

/**
 * Register a join code globally
 */
function registerJoinCode(code: string, chatId: string, createdBy: string, chatName: string): void {
    const registry = getJoinCodeRegistry();
    registry[code] = { chatId, createdBy, chatName };
    localStorage.setItem(getJoinCodeRegistryKey(), JSON.stringify(registry));
    console.log(`📍 Registered join code: ${code}`);
}

/**
 * Get storage key for chat messages (global, shared across users)
 */
function getChatMessagesKey(chatId: string): string {
    return `messages_${chatId}`;
}

/**
 * Get all messages for a chat (shared storage) and mark isOwn based on current user
 */
function getChatMessagesWithUser(chatId: string, currentUsername?: string): ChatMessage[] {
    try {
        const stored = localStorage.getItem(getChatMessagesKey(chatId));
        if (!stored) return [];
        
        const messages = JSON.parse(stored);
        return messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            isOwn: currentUsername ? msg.senderUsername === currentUsername : msg.isOwn,
        }));
    } catch (e) {
        console.error('Failed to load chat messages', e);
        return [];
    }
}

/**
 * Get all messages for a chat (shared storage)
 */
function getChatMessages(chatId: string): ChatMessage[] {
    try {
        const stored = localStorage.getItem(getChatMessagesKey(chatId));
        if (!stored) return [];
        
        const messages = JSON.parse(stored);
        return messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
        }));
    } catch (e) {
        console.error('Failed to load chat messages', e);
        return [];
    }
}

/**
 * Save message to shared global storage
 */
function saveChatMessage(chatId: string, message: ChatMessage): void {
    const messages = getChatMessages(chatId);
    const stored = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
    }));
    stored.push({
        ...message,
        timestamp: message.timestamp.toISOString(),
    });
    localStorage.setItem(getChatMessagesKey(chatId), JSON.stringify(stored));
    console.log(`💬 Message saved to chat ${chatId}`);
}

/**
 * Serialize chats for localStorage
 */
function serializeChats(chats: Chat[]): string {
    const storedChats: StoredChat[] = chats.map(chat => ({
        ...chat,
        messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
        })),
        lastTimestamp: chat.lastTimestamp?.toISOString(),
    }));
    return JSON.stringify(storedChats);
}

/**
 * Deserialize chats from localStorage (messages come from global storage)
 */
function deserializeChats(json: string): Chat[] {
    try {
        const storedChats: StoredChat[] = JSON.parse(json);
        return storedChats.map(chat => ({
            ...chat,
            messages: [], // Messages load from global storage, not from chat storage
            lastTimestamp: chat.lastTimestamp ? new Date(chat.lastTimestamp) : undefined,
        }));
    } catch (e) {
        console.error('Failed to deserialize chats', e);
        return [];
    }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChatState] = useState<Chat | null>(null);

    // Load chats from localStorage when user changes
    useEffect(() => {
        if (user) {
            const key = getUserChatsKey(user.id);
            const stored = localStorage.getItem(key);
            if (stored) {
                const loaded = deserializeChats(stored);
                console.log(`✅ Loaded ${loaded.length} chats for user ${user.username}`);
                setChats(loaded);
            } else {
                console.log(`📝 No chats found for user ${user.username}, starting fresh`);
                setChats([]);
            }
            setActiveChatState(null);
        } else {
            // User logged out
            setChats([]);
            setActiveChatState(null);
        }
    }, [user?.id]);

    // Save chats to localStorage whenever they change
    useEffect(() => {
        if (user && chats.length > 0) {
            const key = getUserChatsKey(user.id);
            localStorage.setItem(key, serializeChats(chats));
            console.log(`💾 Saved ${chats.length} chats for user ${user.username}`);
        }
    }, [chats, user?.id]);

    // Poll for new messages from global storage
    useEffect(() => {
        if (!activeChat) return;

        const interval = setInterval(() => {
            const messages = getChatMessagesWithUser(activeChat.id, user?.username);
            setActiveChatState(prev => {
                if (!prev) return null;
                const hasNewMessages = messages.length > prev.messages.length;
                if (hasNewMessages) {
                    console.log(`🔄 Refreshed messages for ${prev.name}:`, messages.length);
                    return {
                        ...prev,
                        messages,
                    };
                }
                return prev;
            });
        }, 1000); // Poll every second

        return () => clearInterval(interval);
    }, [activeChat?.id, user?.username]);

    const setActiveChat = useCallback((chatId: string) => {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            // Load messages from global storage
            const messages = getChatMessagesWithUser(chatId, user?.username);
            const chatWithMessages: Chat = {
                ...chat,
                messages,
            };
            setActiveChatState(chatWithMessages);
        }
    }, [chats, user?.username]);

    const sendMessage = useCallback((chatId: string, message: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
        if (!user) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: user.username,
            senderUsername: user.username,
            message,
            mediaUrl,
            mediaType,
            timestamp: new Date(),
            isOwn: true,
        };

        // Save to global messages storage
        saveChatMessage(chatId, newMessage);

        // Update active chat with new message
        if (activeChat?.id === chatId) {
            setActiveChatState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...prev.messages, newMessage],
                    lastMessage: message || `📎 ${mediaType}`,
                    lastTimestamp: new Date(),
                };
            });
        }

        // Update chat list to reflect last message
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    lastMessage: message || `📎 ${mediaType}`,
                    lastTimestamp: new Date(),
                };
            }
            return chat;
        }));
    }, [activeChat, user]);

    const createGroupChat = useCallback((groupName: string) => {
        if (!user) return;

        const joinCode = generateJoinCode();
        const newChat: Chat = {
            id: `chat-${Date.now()}-${Math.random()}`,
            name: groupName,
            messages: [],
            unread: 0,
            joinCode,
            createdBy: user.username,
            isGroup: true,
            members: [user.username],
            lastMessage: undefined,
            lastTimestamp: undefined,
        };

        setChats(prev => [newChat, ...prev]);
        setActiveChatState(newChat);
        
        // Register join code globally so others can find it
        registerJoinCode(joinCode, newChat.id, user.username, groupName);
        
        console.log('✅ Group chat created:', { name: groupName, code: joinCode, id: newChat.id });
    }, [user]);

    const markAsRead = useCallback((chatId: string) => {
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                return { ...chat, unread: 0 };
            }
            return chat;
        }));
    }, []);

    const getJoinCode = useCallback((chatId: string): string => {
        const chat = chats.find(c => c.id === chatId);
        return chat?.joinCode || '';
    }, [chats]);

    const joinChatWithCode = useCallback((joinCode: string): boolean => {
        if (!user) return false;

        // Look up code in registry
        const registry = getJoinCodeRegistry();
        const codeInfo = registry[joinCode.toUpperCase()];
        
        if (!codeInfo) {
            console.log('❌ Join code not found:', joinCode);
            return false;
        }

        // Check if already joined this chat
        const alreadyJoined = chats.some(c => c.joinCode === joinCode.toUpperCase());
        if (alreadyJoined) {
            console.log('ℹ️ Already joined this chat:', joinCode);
            const existingChat = chats.find(c => c.joinCode === joinCode.toUpperCase());
            if (existingChat) {
                const messages = getChatMessagesWithUser(existingChat.id, user?.username);
                setActiveChatState({ ...existingChat, messages });
            }
            return true;
        }

        // Create a new chat entry for this user with the same details
        const newChat: Chat = {
            id: codeInfo.chatId,
            name: codeInfo.chatName,
            messages: [],
            unread: 0,
            joinCode: joinCode.toUpperCase(),
            createdBy: codeInfo.createdBy,
            isGroup: true,
            members: [user.username],
            lastMessage: undefined,
            lastTimestamp: undefined,
        };

        setChats(prev => [newChat, ...prev]);
        
        // Load messages from global storage
        const messages = getChatMessagesWithUser(codeInfo.chatId, user.username);
        const chatWithMessages = {
            ...newChat,
            messages,
        };
        setActiveChatState(chatWithMessages);
        
        console.log(`✅ Joined chat with code ${joinCode}:`, codeInfo.chatName, `(${messages.length} messages)`);
        return true;
    }, [user, chats]);

    return (
        <ChatContext.Provider value={{ chats, activeChat, setActiveChat, sendMessage, createGroupChat, markAsRead, getJoinCode, joinChatWithCode }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);
