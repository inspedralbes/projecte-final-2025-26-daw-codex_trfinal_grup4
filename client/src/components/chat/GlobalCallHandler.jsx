import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import socketService from "@/services/socketService";
import api from "@/services/api";
import "./GlobalCallHandler.css";

export default function GlobalCallHandler() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  // Avoid showing global handler if already on the messages page
  // (We'll let Messages.jsx auto-accept if we redirected there, 
  // but if they are ALREADY there, we don't need this toast? 
  // Actually, Messages no longer has the listener, so we DO need it here always, 
  // but maybe we just redirect if accepted).
  
  useEffect(() => {
    if (!user) return;

    const handleIncomingCall = async (data) => {
      setIncomingCall(data);
      
      try {
        const response = await api.get(`/users/${data.from}`);
        setCallerInfo(response.data.user);
      } catch (error) {
        console.error("Error fetching caller info:", error);
      }
    };

    socketService.onIncomingCall(handleIncomingCall);

    return () => {
      socketService.offIncomingCall(handleIncomingCall);
    };
  }, [user]);

  // If call is rejected globally or caller hangs up
  useEffect(() => {
    if (!incomingCall) return;

    const handleEndedOrRejected = () => {
      setIncomingCall(null);
      setCallerInfo(null);
    };

    socketService.onCallEnded(handleEndedOrRejected);
    socketService.onCallRejected(handleEndedOrRejected);

    return () => {
      socketService.offCallEnded(handleEndedOrRejected);
      socketService.offCallRejected(handleEndedOrRejected);
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    // Navigate to messages page and pass the call data
    navigate(`/messages?user=${incomingCall.from}`, {
      state: { incomingCallData: { ...incomingCall, autoAnswer: true } }
    });
    setIncomingCall(null);
    setCallerInfo(null);
  };

  const handleReject = () => {
    socketService.rejectCall({ to: incomingCall.from, from: user?.id });
    setIncomingCall(null);
    setCallerInfo(null);
  };

  return (
    <div className="global-call-toast">
      <div className="global-call-toast__content">
        <div className="global-call-toast__avatar">
          {callerInfo?.avatar ? (
            <img src={callerInfo.avatar} alt="caller" />
          ) : (
            <span>{callerInfo?.name?.charAt(0) || "U"}</span>
          )}
        </div>
        <div className="global-call-toast__info">
          <h4>{callerInfo?.name || "Usuario"}</h4>
          <p>
            {incomingCall.isVideo
              ? t("messages.call.video_call", "Videollamada entrante")
              : t("messages.call.audio_call", "Llamada entrante")}
          </p>
        </div>
      </div>
      <div className="global-call-toast__actions">
        <button className="global-call-btn reject" onClick={handleReject}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
        </button>
        <button className="global-call-btn accept" onClick={handleAccept}>
          {incomingCall.isVideo ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
}
