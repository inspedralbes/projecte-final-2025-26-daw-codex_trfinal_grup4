import React, { useEffect, useRef, useState } from "react";
import socketService from "../../services/socketService";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import "./VideoCall.css";

const VideoCall = ({ partnerId, isIncoming, incomingSignal, callerInfo, onEnd, isVideoCall = true, autoAnswer = false }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [mediaInitialized, setMediaInitialized] = useState(false);
  const [isPeerVideoOff, setIsPeerVideoOff] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: isVideoCall, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        setMediaInitialized(true);
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        // Fallback to audio only if video fails
        if (isVideoCall) {
          navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(audioStream => {
              setStream(audioStream);
              setIsVideoOff(true);
              setMediaInitialized(true);
            }).catch(e => {
              console.error("Failed fallback audio stream", e);
              setMediaInitialized(true);
            });
        } else {
          setMediaInitialized(true);
        }
      });

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.close();
      }
    };
  }, [isVideoCall]);

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream, callAccepted, isVideoCall, isVideoOff]);

  useEffect(() => {
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted, isVideoCall, isPeerVideoOff]);
  useEffect(() => {
    if (!isIncoming && mediaInitialized) {
      // Initiate call
      callUser();
    }
  }, [mediaInitialized, isIncoming]);

  useEffect(() => {
    // Auto answer if prop is true
    if (autoAnswer && isIncoming && mediaInitialized && !callAccepted) {
      answerCall();
    }
  }, [autoAnswer, isIncoming, mediaInitialized, callAccepted]);

  useEffect(() => {
    // Listeners for WebRTC signaling
    const handleAnswered = (data) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
      }
    };

    const handleIceCandidate = (data) => {
      if (connectionRef.current) {
        connectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error("Error adding ice candidate", e));
      }
    };

    const handleEnded = () => {
      setCallEnded(true);
      endCall();
    };

    const handleRejected = () => {
      setCallEnded(true);
      endCall();
    };

    socketService.onCallAnswered(handleAnswered);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallEnded(handleEnded);
    socketService.onCallRejected(handleRejected);

    socketService.onPeerVideoToggle((data) => {
      setIsPeerVideoOff(data.isVideoOff);
    });

    return () => {
      socketService.offCallAnswered(handleAnswered);
      socketService.offIceCandidate(handleIceCandidate);
      socketService.offCallEnded(handleEnded);
      socketService.offCallRejected(handleRejected);
      socketService.offPeerVideoToggle();
    };
  }, []);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    });

    if (stream) {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    }

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate({
          to: partnerId,
          from: user.id,
          candidate: event.candidate
        });
      }
    };

    return peer;
  };

  const callUser = async () => {
    const peer = createPeerConnection();
    connectionRef.current = peer;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      
      socketService.callUser({
        userToCall: partnerId,
        signalData: offer,
        from: user.id,
        callerInfo: { name: user.name, avatar: user.avatar },
        isVideo: isVideoCall
      });
    } catch (err) {
      console.error("Error calling user:", err);
    }
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const peer = createPeerConnection();
    connectionRef.current = peer;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(incomingSignal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketService.answerCall({
        signal: answer,
        to: partnerId,
        from: user.id
      });
    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  const rejectCall = () => {
    socketService.rejectCall({ to: partnerId, from: user.id });
    endCall();
  };

  const endCall = () => {
    setCallEnded(true);
    socketService.endCall({ to: partnerId, from: user.id });
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onEnd();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const newStatus = !videoTrack.enabled;
        videoTrack.enabled = newStatus;
        setIsVideoOff(!newStatus);
        
        socketService.sendVideoToggle({
          to: partnerId,
          from: user.id,
          isVideoOff: !newStatus
        });
      }
    }
  };

  return (
    <div className="vc-overlay">
      <div className="vc-container">
        {isIncoming && !callAccepted ? (
          <div className="vc-incoming">
            <div className="vc-avatar">
              {callerInfo?.avatar ? <img src={callerInfo.avatar} alt="caller" /> : <span>{callerInfo?.name?.charAt(0)}</span>}
            </div>
            <h3>{callerInfo?.name} {t("messages.call.is_calling")}</h3>
            <p>{isVideoCall ? t("messages.call.video_call") : t("messages.call.audio_call")}</p>
            <div className="vc-actions">
              <button className="vc-btn accept" onClick={answerCall}>
                {t("messages.call.accept")}
              </button>
              <button className="vc-btn reject" onClick={rejectCall}>
                {t("messages.call.reject")}
              </button>
            </div>
          </div>
        ) : (
          <div className={`vc-active ${!isVideoCall ? 'vc-audio-only' : ''}`}>
            {isVideoCall ? (
              <div className="vc-video-container">
                <div className="vc-remote-video">
                  {callAccepted && !callEnded ? (
                    <>
                      {isPeerVideoOff && (
                        <div className="vc-video-off-placeholder" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          <p>{callerInfo?.name} ha apagado la cámara</p>
                        </div>
                      )}
                      <video 
                        playsInline 
                        ref={userVideo} 
                        autoPlay 
                        style={{ display: isPeerVideoOff ? 'none' : 'block' }} 
                      />
                    </>
                  ) : (
                    <div className="vc-waiting">{t("messages.call.calling")}</div>
                  )}
                </div>
                <div className="vc-local-video">
                  {isVideoOff ? (
                    <div className="vc-video-off-placeholder small">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    </div>
                  ) : (
                    <video playsInline muted ref={myVideo} autoPlay />
                  )}
                </div>
              </div>
            ) : (
              <div className="vc-audio-container">
                <div className="vc-audio-avatar-wrapper">
                  <div className={`vc-audio-avatar ${callAccepted ? 'connected' : 'calling'}`}>
                    {callerInfo?.avatar ? <img src={callerInfo.avatar} alt="caller" /> : <span>{callerInfo?.name?.charAt(0)}</span>}
                  </div>
                </div>
                <h3>{callerInfo?.name}</h3>
                <p className="vc-call-status">
                  {callAccepted ? t("messages.call.ongoing", "Llamada en curso...") : t("messages.call.calling")}
                </p>
                {/* Usamos etiquetas audio para evitar que el navegador las pause al estar ocultas */}
                <audio ref={userVideo} autoPlay />
                <audio muted ref={myVideo} autoPlay />
              </div>
            )}
            
            <div className="vc-controls">
              <button className={`vc-control-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                {isMuted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                )}
              </button>
              
              <button className="vc-control-btn hangup" onClick={endCall}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
              </button>

              {isVideoCall && (
                <button className={`vc-control-btn ${isVideoOff ? 'video-off' : ''}`} onClick={toggleVideo}>
                  {isVideoOff ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
