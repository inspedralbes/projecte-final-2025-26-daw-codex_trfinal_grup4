import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import socketService from "@/services/socketService";
import api from "@/services/api";
import chatService from "@/services/chatService";
import GlitchText from "@/components/ui/GlitchText";
import "./GlobalMessageHandler.css";

export default function GlobalMessageHandler() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [toast, setToast] = useState(null); // { sender: {...}, content: "..." }
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (data) => {
      // Ignore system messages or messages from self
      if (data.type === "system" || parseInt(data.sender_id) === user.id) return;

      // Check if we are already viewing this chat
      const activeUserId = searchParams.get("user");
      const activeGroupId = searchParams.get("group");
      const isMessagesPage = location.pathname === "/messages";

      if (isMessagesPage) {
        if (data.group_id && String(data.group_id) === activeGroupId) return;
        if (!data.group_id && String(data.sender_id) === activeUserId) return;
      }

      // Fetch sender info if missing or if it's just an ID
      let senderInfo = data.sender;
      const senderId = data.sender_id || (typeof data.sender === "number" || typeof data.sender === "string" ? data.sender : null) || data.from;
      
      if ((!senderInfo || typeof senderInfo !== "object") && senderId) {
        try {
          // Fallback to fetching conversations to find the partner info
          const response = await chatService.getConversations();
          const conversation = response.conversations?.find(c => 
            (c.type === "private" && c.partner?.id === parseInt(senderId)) ||
            (c.type === "group" && c.group?.id === data.group_id)
          );
          
          if (conversation) {
            senderInfo = conversation.type === "group" ? { name: conversation.group.name, avatar: conversation.group.image_url } : conversation.partner;
          }
        } catch (error) {
          console.error("Error fetching sender info from conversations:", error);
        }
      }

      // Show toast
      setToast({ ...data, sender: senderInfo });
      setShow(true);

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        // Clear toast data after animation completes
        setTimeout(() => setToast(null), 300);
      }, 5000);

      return () => clearTimeout(timer);
    };

    socketService.on("new.message", handleNewMessage);

    return () => {
      socketService.off("new.message", handleNewMessage);
    };
  }, [user, location.pathname, searchParams]);

  if (!toast || !show) return null;

  const senderName = toast.sender?.name || "Usuario";
  const senderAvatar = toast.sender?.avatar;
  const content = toast.content;

  const handleClick = () => {
    if (toast.group_id) {
      navigate(`/messages?group=${toast.group_id}`);
    } else {
      navigate(`/messages?user=${toast.sender_id}`);
    }
    setShow(false);
    setTimeout(() => setToast(null), 300);
  };

  return createPortal(
    <div className={`global-msg-toast ${show ? "show" : ""}`} onClick={handleClick}>
      <div className="global-msg-toast__header">
        <div className="global-msg-toast__avatar">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName} />
          ) : (
            <span>{senderName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="global-msg-toast__info">
          <span className="global-msg-toast__name">
            <GlitchText>{senderName}</GlitchText>
          </span>
          <span className="global-msg-toast__type">
            {toast.group_id ? t("messages.group_chat", "Chat de grupo") : t("messages.new_message", "Mensaje nuevo")}
          </span>
        </div>
        <button 
          className="global-msg-toast__close" 
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
          }}
        >
          ×
        </button>
      </div>
      <div className="global-msg-toast__body">
        <p className="global-msg-toast__text">
          {content.length > 60 ? `${content.slice(0, 60)}...` : content}
        </p>
      </div>
      <div className="global-msg-toast__scanline"></div>
    </div>,
    document.body
  );
}
