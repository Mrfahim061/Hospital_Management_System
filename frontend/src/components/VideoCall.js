import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import '../styles.css'; // Importing the CSS file

const VideoCall = () => {
    const myVideo = useRef(null);
    const remoteVideo = useRef(null);
    const socket = useRef();
    const peerConnection = useRef(null);
    const [roomId] = useState('room1');
    const [callStarted, setCallStarted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);

    const servers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
        ],
    };

    useEffect(() => {
        // Initialize Socket.IO
        socket.current = io('http://192.204.1.107:5000'); // Replace with your backend URL

        // Get local media stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
                myVideo.current.srcObject = stream;
                
                // Ensure video plays after loading
                myVideo.current.onloadedmetadata = () => {
                    myVideo.current.play().catch(err => console.error('Error playing local video:', err));
                };

                // Initialize PeerConnection
                peerConnection.current = new RTCPeerConnection(servers);

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    peerConnection.current.addTrack(track, stream);
                });

                // Handle ICE candidate exchange
                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.current.emit('ice-candidate', event.candidate);
                    }
                };

                // Handle remote stream
                peerConnection.current.ontrack = (event) => {
                    if (remoteVideo.current) {
                        remoteVideo.current.srcObject = event.streams[0];
                        remoteVideo.current.play().catch(err => console.error('Error playing remote video:', err));
                    }
                };

                // Handle connection state changes
                peerConnection.current.onconnectionstatechange = () => {
                    if (peerConnection.current.connectionState === 'disconnected') {
                        console.warn('Peer disconnected, attempting reconnection...');
                    }
                };

                // Join the room
                socket.current.emit('join-room', roomId, socket.current.id);
            })
            .catch(err => console.error('Error accessing media devices:', err));

        // Socket event listeners
        socket.current.on('offer', async (data) => {
            if (peerConnection.current.signalingState !== "stable") {
                console.warn("Received offer but signaling state is", peerConnection.current.signalingState);
                return;
            }
        
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.current.emit('answer', answer);
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });
        

        socket.current.on('answer', async (data) => {
            if (peerConnection.current.signalingState !== "have-local-offer") {
                console.warn("Received answer but signaling state is", peerConnection.current.signalingState);
                return;
            }
        
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data));
            } catch (error) {
                console.error("Error setting remote description:", error);
            }
        });
        

        socket.current.on('ice-candidate', async (data) => {
            try {
                await peerConnection.current.addIceCandidate(data);
            } catch (err) {
                console.error('Error adding received ICE candidate', err);
            }
        });

        // When a new user joins, create and send an offer
        socket.current.on('user-connected', async () => {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.current.emit('offer', offer);
        });

        // Cleanup on component unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, [roomId]);

    // Toggle Video On/Off
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    // Toggle Audio On/Off
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    // End Call
    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (socket.current) {
            socket.current.disconnect();
        }
        setCallStarted(false);
    };

    const handleStartCall = () => {
        setCallStarted(true);
        if (remoteVideo.current) {
            remoteVideo.current.play().catch(err => console.error('Error playing remote video:', err));
        }
    };

    return (
        <div>
            <div className="video-container">
                <div>
                    <h3>My Camera</h3>
                    <video ref={myVideo} className="video-frame" autoPlay muted />
                </div>
                <div>
                    <h3>Remote Camera</h3>
                    <video ref={remoteVideo} className="video-frame" autoPlay />
                </div>
            </div>

            {/* Buttons for Video, Audio, and Call End */}
            <div className="video-controls">
                <button onClick={toggleVideo}>
                    {isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
                <button onClick={toggleAudio}>
                    {isAudioOn ? 'Mute' : 'Unmute'}
                </button>
                <button className="end-call-btn" onClick={endCall}>
                    End Call
                </button>
            </div>

            {!callStarted && (
                <button className="start-call-btn" onClick={handleStartCall}>Start Call</button>
            )}
        </div>
    );
};

export default VideoCall;
