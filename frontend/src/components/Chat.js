import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import '../styles.css'; // Importing the CSS file

const Chat = ({ roomId, userId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io('http://localhost:5000'); // Connect to backend

        socket.current.emit('join-room', roomId, userId);

        socket.current.off('chat-message').on('chat-message', ({ userId: senderId, message }) => {
            setMessages((prev) => [...prev, { senderId, message }]);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [roomId, userId]);

    const sendMessage = () => {
        if (input.trim()) {
            socket.current.emit('chat-message', { roomId, userId, message: input });
            setInput(''); // ✅ Clear input after sending
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">Chat</div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <p 
                        key={index} 
                        className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                    >
                        <strong>{msg.senderId}:</strong> {msg.message}
                    </p>
                ))}
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="chat-input"
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="send-button">Send</button>
            </div>
        </div>
    );
};

export default Chat;
