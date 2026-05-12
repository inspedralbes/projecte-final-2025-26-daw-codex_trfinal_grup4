import React, { useEffect, useRef, useState } from "react";
import socketService from "../../services/socketService";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import "./VideoCall.css";

const VideoCall = ({
  partnerId,
  isIncoming,
  incomingSignal,
  callerInfo,
  onEnd,
  onReject,
  onAccept,
  isVideoCall = true,
  autoAnswer = false,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [mediaInitialized, setMediaInitialized] = useState(false);
  const [isPeerVideoOff, setIsPeerVideoOff] = useState(false);
  const [isPeerMuted, setIsPeerMuted] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("initializing");

  const onEndRef = useRef(onEnd);
  const onRejectRef = useRef(onReject);
  const onAcceptRef = useRef(onAccept);

  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  useEffect(() => { onRejectRef.current = onReject; }, [onReject]);
  useEffect(() => { onAcceptRef.current = onAccept; }, [onAccept]);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const candidatesQueue = useRef([]);
  const remoteDescriptionSet = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError("insecure");
      setMediaInitialized(true);
      return;
    }

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: isVideoCall, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        setMediaInitialized(true);
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionError("denied");
          setMediaInitialized(true);
          return;
        }

        // Fallback to audio only if video fails (other than permission)
        if (isVideoCall) {
          navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((audioStream) => {
              setStream(audioStream);
              setIsVideoOff(true);
              setMediaInitialized(true);
            })
            .catch((e) => {
              console.error("Failed fallback audio stream", e);
              if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
                setPermissionError("denied");
              }
              setMediaInitialized(true);
            });
        } else {
          setMediaInitialized(true);
        }
      });

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
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
    const videoElement = userVideo.current;
    if (videoElement && remoteStream) {
      const tracks = remoteStream.getTracks();
      console.log(`[VideoCall] Attaching remoteStream to ${isVideoCall ? "video" : "audio"} element. Tracks:`, 
        tracks.map(t => `${t.kind} (${t.readyState}, enabled: ${t.enabled})`));
      
      if (videoElement.srcObject !== remoteStream) {
        videoElement.srcObject = remoteStream;
      }
      
      const playMedia = () => {
        videoElement.play()
          .then(() => {
            console.log("[VideoCall] Playback started successfully");
            if (isVideoCall && videoElement.videoWidth === 0) {
              console.warn("[VideoCall] Video playing but width is 0. This might be why it is black.");
            }
          })
          .catch(e => {
            console.error("[VideoCall] Playback failed:", e);
          });
      };

      if (isVideoCall) {
        videoElement.onloadedmetadata = () => {
          console.log(`[VideoCall] Video metadata loaded: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          playMedia();
        };
      } else {
        playMedia();
      }

      // Ensure it plays even if it was paused
      playMedia();

      // Some browsers need a nudge when tracks are added to the same stream
      const handleTrackChange = () => {
        console.log("[VideoCall] Track added/removed, restarting playback...");
        playMedia();
      };
      
      remoteStream.addEventListener("addtrack", handleTrackChange);
      remoteStream.addEventListener("removetrack", handleTrackChange);
      
      return () => {
        remoteStream.removeEventListener("addtrack", handleTrackChange);
        remoteStream.removeEventListener("removetrack", handleTrackChange);
      };
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

  const processCandidatesQueue = () => {
    if (connectionRef.current && remoteDescriptionSet.current) {
      console.log(`[VideoCall] Processing ${candidatesQueue.current.length} queued candidates`);
      candidatesQueue.current.forEach((candidate) => {
        connectionRef.current.addIceCandidate(candidate)
          .then(() => console.log("[VideoCall] Queued ICE candidate added successfully"))
          .catch((e) => console.error("Error adding queued ice candidate", e));
      });
      candidatesQueue.current = [];
    }
  };

  const handleIceCandidate = (data) => {
    const candidate = new RTCIceCandidate(data.candidate);
    const type = data.candidate.candidate.split(' ')[7]; // Simple way to get candidate type
    console.log(`[VideoCall] Received ICE candidate (${type}) from peer`);
    
    if (connectionRef.current && remoteDescriptionSet.current) {
      connectionRef.current.addIceCandidate(candidate)
        .then(() => console.log("[VideoCall] ICE candidate added successfully"))
        .catch((e) => console.error("Error adding ice candidate", e));
    } else {
      console.log("[VideoCall] Queuing ICE candidate");
      candidatesQueue.current.push(candidate);
    }
  };

  useEffect(() => {
    // Listeners for WebRTC signaling
    const handleAnswered = async (data) => {
      if (remoteDescriptionSet.current) {
        console.log("[VideoCall] Remote description already set, ignoring duplicate answer");
        return;
      }
      
      // Mark as set immediately to prevent race conditions
      remoteDescriptionSet.current = true;
      setCallAccepted(true);
      if (connectionRef.current) {
        try {
          await connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
          remoteDescriptionSet.current = true;
          processCandidatesQueue();
        } catch (e) {
          console.error("Error setting remote description on answer", e);
        }
      }
    };

    const handleEnded = () => {
      console.log("[VideoCall] Received call-ended from peer");
      endCall(true); // true means it was triggered by remote
    };

    const handleRejected = () => {
      console.log("[VideoCall] Received call-rejected from peer");
      endCall(true);
    };

    socketService.onCallAnswered(handleAnswered);
    socketService.onIceCandidate(handleIceCandidate);
    socketService.onCallEnded(handleEnded);
    socketService.onCallRejected(handleRejected);

    const onVideoToggle = (data) => setIsPeerVideoOff(data.isVideoOff);
    const onAudioToggle = (data) => setIsPeerMuted(data.isMuted);

    socketService.onPeerVideoToggle(onVideoToggle);
    socketService.onPeerAudioToggle(onAudioToggle);

    return () => {
      socketService.offCallAnswered(handleAnswered);
      socketService.offIceCandidate(handleIceCandidate);
      socketService.offCallEnded(handleEnded);
      socketService.offCallRejected(handleRejected);
      socketService.offPeerVideoToggle(onVideoToggle);
      socketService.offPeerAudioToggle(onAudioToggle);
    };
  }, [partnerId]);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
        {
          urls: [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:443?transport=tcp"
          ],
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:relay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:relay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],
      iceCandidatePoolSize: 10,
    });

    if (stream) {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    }

    peer.ontrack = (event) => {
      console.log("[VideoCall] Received remote track:", event.track.kind);
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log("[VideoCall] Using stream from event. Tracks in stream:", stream.getTracks().length);
        
        // We set the stream. If it's the same object, React won't re-render, 
        // but our useEffect will handle the already-attached srcObject.
        // To ensure a re-render when the FIRST track arrives, we check if it's already set.
        setRemoteStream((prev) => {
          if (prev === stream) return prev;
          return stream;
        });
      } else {
        // Fallback for browsers that don't provide streams in the event
        setRemoteStream((prevStream) => {
          if (prevStream) {
            if (prevStream.getTracks().find(t => t.id === event.track.id)) {
              return prevStream;
            }
            const newStream = new MediaStream(prevStream.getTracks());
            newStream.addTrack(event.track);
            return newStream;
          }
          return new MediaStream([event.track]);
        });
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        const type = event.candidate.candidate.split(' ')[7];
        console.log(`[VideoCall] Sending ICE candidate (${type}) to peer`);
        socketService.sendIceCandidate({
          to: partnerId,
          from: user.id,
          candidate: event.candidate,
        });
      } else {
        console.log("[VideoCall] ICE candidate gathering complete");
      }
    };

    peer.onicecandidateerror = (event) => {
      console.warn("[VideoCall] ICE candidate error:", event.errorCode, event.errorText, event.url);
    };

    peer.oniceconnectionstatechange = () => {
      console.log("[VideoCall] ICE Connection State:", peer.iceConnectionState);
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        setConnectionStatus("connected");
      } else if (peer.iceConnectionState === "failed") {
        console.error("[VideoCall] ICE Connection FAILED. This usually means a TURN server is needed and either missing or blocked.");
        setConnectionStatus("failed");
      } else if (peer.iceConnectionState === "disconnected") {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("connecting");
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("[VideoCall] Connection State:", peer.connectionState);
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
        isVideo: isVideoCall,
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
      remoteDescriptionSet.current = true;
      processCandidatesQueue();
      
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketService.answerCall({
        signal: answer,
        to: partnerId,
        from: user.id,
      });
    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  const rejectCall = () => {
    socketService.rejectCall({ to: partnerId, from: user.id });
    if (onRejectRef.current) onRejectRef.current();
  };

  const endCall = (isRemote = false) => {
    console.log(`[VideoCall] endCall triggered (isRemote: ${isRemote}), current callEnded: ${callEnded}`);
    if (callEnded) return;
    setCallEnded(true);
    
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    
    if (!isRemote) {
      console.log("[VideoCall] Sending end-call to peer via socket");
      socketService.endCall({ to: partnerId, from: user.id });
    }
    
    setTimeout(() => {
      console.log("[VideoCall] Calling onEndRef.current()");
      if (onEndRef.current) onEndRef.current();
    }, 1500);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newStatus = !audioTracks[0].enabled;
        
        // Update all tracks in the local stream
        audioTracks.forEach(track => {
          track.enabled = newStatus;
          console.log(`[VideoCall] Local track ${track.id} enabled: ${track.enabled}`);
        });

        // CRITICAL: Update the track on the RTCPeerConnection senders as well
        if (connectionRef.current) {
          connectionRef.current.getSenders().forEach(sender => {
            if (sender.track && sender.track.kind === 'audio') {
              sender.track.enabled = newStatus;
              console.log(`[VideoCall] RTC Sender track enabled: ${sender.track.enabled}`);
            }
          });
        }

        setIsMuted(!newStatus);

        socketService.sendAudioToggle({
          to: partnerId,
          from: user.id,
          isMuted: !newStatus,
        });
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
          isVideoOff: !newStatus,
        });
      }
    }
  };

  return (
    <div className="vc-overlay">
      <div className="vc-container">
        {permissionError ? (
          <div className="vc-incoming">
            <div className="vc-avatar" style={{ background: "var(--codex-coral, #ff5f56)" }}>
              <span>!</span>
            </div>
            <h3>{t("common.error_generic")}</h3>
            <p style={{ color: "#ef4444", maxWidth: "80%", margin: "0 auto 30px" }}>
              {permissionError === "denied" 
                ? t("messages.call.permission_denied")
                : t("messages.call.secure_context_required")}
            </p>
            <div className="vc-actions">
              <button className="vc-btn reject" onClick={onEnd}>
                {t("common.close")}
              </button>
            </div>
          </div>
        ) : connectionStatus === 'failed' ? (
          <div className="vc-incoming">
            <div className="vc-avatar" style={{ background: "#ef4444" }}>
              <span>!</span>
            </div>
            <h3>Error de conexión</h3>
            <p style={{ color: "#ef4444", maxWidth: "80%", margin: "0 auto 30px", fontSize: '0.9rem' }}>
              No se pudo establecer la conexión directa. Esto suele ocurrir por restricciones de red (Firewall/NAT). Se requiere un servidor TURN para este entorno.
            </p>
            <div className="vc-actions">
              <button className="vc-btn reject" onClick={onEnd}>
                {t("common.close")}
              </button>
            </div>
          </div>
        ) : isIncoming && !callAccepted ? (
          <div className="vc-incoming">
            <div className="vc-avatar">
              {callerInfo?.avatar ? (
                <img src={callerInfo.avatar} alt="caller" />
              ) : (
                <span>{callerInfo?.name?.charAt(0)}</span>
              )}
            </div>
            <h3>
              {callerInfo?.name} {t("messages.call.is_calling")}
            </h3>
            <p>{isVideoCall ? t("messages.call.video_call") : t("messages.call.audio_call")}</p>
            <div className="vc-actions">
              {!autoAnswer && (
                <button className="vc-btn accept" onClick={answerCall}>
                  {t("messages.call.accept")}
                </button>
              )}
              <button className="vc-btn reject" onClick={rejectCall}>
                {t("messages.call.reject")}
              </button>
            </div>
          </div>
        ) : (
          <div className={`vc-active ${!isVideoCall ? "vc-audio-only" : ""}`}>
            {isVideoCall ? (
              <div className="vc-video-container">
                <div className="vc-remote-video">
                  {callAccepted && !callEnded ? (
                    <>
                      {isPeerVideoOff && (
                        <div
                          className="vc-video-off-placeholder"
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10 }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                          <p>{callerInfo?.name} {t("messages.call.camera_off_peer", "ha apagado la cámara")}</p>
                        </div>
                      )}
                      <video 
                        playsInline 
                        ref={userVideo} 
                        autoPlay 
                        style={{ 
                          display: isPeerVideoOff ? "none" : "block",
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: '#000'
                        }} 
                      />
                    </>
                  ) : (
                    <div className="vc-waiting">
                      {t("messages.call.calling")} {callerInfo?.name}...
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '10px' }}>
                        {connectionStatus === 'connecting' ? t("common.loading") : connectionStatus}
                      </div>
                    </div>
                  )}
                  {callAccepted && !callEnded && isPeerMuted && (
                    <div className="vc-peer-muted-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                      <span>{t("messages.call.mic_off_peer", "ha silenciado su micro")}</span>
                    </div>
                  )}
                </div>
                <div className="vc-local-video">
                  {isVideoOff ? (
                    <div className="vc-video-off-placeholder small">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </div>
                  ) : (
                    <video playsInline muted ref={myVideo} autoPlay />
                  )}
                </div>
              </div>
            ) : (
              <div className="vc-audio-container">
                <div className="vc-audio-avatar-wrapper">
                  <div className={`vc-audio-avatar ${callAccepted ? "connected" : "calling"}`}>
                    {callerInfo?.avatar ? (
                      <img src={callerInfo.avatar} alt="caller" />
                    ) : (
                      <span>{callerInfo?.name?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <h3>{callerInfo?.name}</h3>
                <p className="vc-call-status">
                  {callAccepted ? t("messages.call.ongoing", "Llamada en curso...") : t("messages.call.calling")}
                  {callAccepted && connectionStatus !== 'connected' && (
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>({connectionStatus}...)</span>
                  )}
                </p>
                {callAccepted && isPeerMuted && (
                  <div className="vc-audio-peer-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    <span>{t("messages.call.mic_off_peer", "Micro silenciado")}</span>
                  </div>
                )}
                {isMuted && (
                  <div className="vc-local-muted-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    <span>{t("messages.call.mic_off_local", "Tu micrófono está silenciado")}</span>
                  </div>
                )}
                {/* Usamos etiquetas audio para evitar que el navegador las pause al estar ocultas */}
                <audio ref={userVideo} autoPlay />
                <audio muted ref={myVideo} autoPlay />
              </div>
            )}

            <div className="vc-controls">
              <button className={`vc-control-btn ${isMuted ? "muted" : ""}`} onClick={toggleMute}>
                {isMuted ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </button>

              <button className="vc-control-btn hangup" onClick={endCall}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                  <line x1="23" y1="1" x2="1" y2="23"></line>
                </svg>
              </button>

              {isVideoCall && (
                <button className={`vc-control-btn ${isVideoOff ? "video-off" : ""}`} onClick={toggleVideo}>
                  {isVideoOff ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
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
