"use client";

import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import { useSession } from "next-auth/react";

const transformChatData = (threads, currentUserId) => {
  const result = { pinned: [], recent: [] };
  
  threads.forEach(t => {
    // Find the user (not agent) in memberships
    const userMember = t.memberships.find(m => m.user && m.role === "participant");
    const name = userMember?.user?.name || "Unknown User";
    const initials = name.substring(0, 2).toUpperCase();
    
    // Group messages
    const groupedMessages = [];
    let currentGroup = null;

    t.messages.forEach(msg => {
      const isMe = msg.senderId === currentUserId;
      const isAgent = msg.senderType === "agent" || msg.senderType === "system";
      const senderKey = isMe ? "agent" : "user";
      
      let parsedContent = [];
      try {
        parsedContent = JSON.parse(msg.content);
        if (!Array.isArray(parsedContent)) parsedContent = [msg.content];
      } catch (e) {
        parsedContent = [msg.content];
      }

      const displayName = isMe ? "You" : (isAgent ? "Agent" : name);
      const displayAvatar = isMe ? "YO" : (isAgent ? "AG" : initials);

      if (!currentGroup || currentGroup.sender !== senderKey) {
        currentGroup = {
          id: msg.id,
          sender: senderKey,
          senderName: displayName,
          avatar: displayAvatar,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bubbles: [...parsedContent]
        };
        groupedMessages.push(currentGroup);
      } else {
        currentGroup.bubbles.push(...parsedContent);
      }
    });

    const lastMsg = t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
    let snippetText = "No messages";
    if (lastMsg) {
      try {
        const parsed = JSON.parse(lastMsg.content);
        snippetText = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch (e) {
        snippetText = lastMsg.content;
      }
    }

    const chatObj = {
      id: t.id,
      name,
      time: t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      snippet: snippetText.substring(0, 30) + (snippetText.length > 30 ? "..." : ""),
      unread: 0,
      pinned: t.pinned,
      initials,
      flag: "🌍", // Mock flag
      messages: groupedMessages
    };

    if (t.pinned) {
      result.pinned.push(chatObj);
    } else {
      result.recent.push(chatObj);
    }
  });

  return result;
};

export default function SupportChat() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [chats, setChats] = useState({ pinned: [], recent: [] });
  const [activeId, setActiveId] = useState(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!currentUserId) return;
    fetch("/api/admin/threads?type=LiveChat")
      .then(res => res.json())
      .then(data => {
        if (data.threads) {
          const transformed = transformChatData(data.threads, currentUserId);
          setChats(transformed);
          if (transformed.pinned.length > 0) {
            setActiveId(transformed.pinned[0].id);
          } else if (transformed.recent.length > 0) {
            setActiveId(transformed.recent[0].id);
          }
        }
      })
      .catch(console.error);
  }, [currentUserId]);

  // CC settings state variables
  const [showCcPopover, setShowCcPopover] = useState(false);
  const [ccUsername, setCcUsername] = useState("");
  const [ccEmailNotify, setCcEmailNotify] = useState(true);

  // Close CC popover on window click
  useEffect(() => {
    const closePopover = () => setShowCcPopover(false);
    window.addEventListener("click", closePopover);
    return () => window.removeEventListener("click", closePopover);
  }, []);

  const activeChat = 
    chats.pinned.find(c => c.id === activeId) || 
    chats.recent.find(c => c.id === activeId);

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    try {
      const payload = {
        content: JSON.stringify([inputText]),
        senderType: "agent"
      };

      const res = await fetch(`/api/user/chat/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to send chat message");

      const newBubbleText = inputText;
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Update active chat messages optimistically
      const updatedMessages = [...activeChat.messages];
      const lastMsg = updatedMessages[updatedMessages.length - 1];

      if (lastMsg && lastMsg.sender === "agent") {
        lastMsg.bubbles = [...lastMsg.bubbles, newBubbleText];
        lastMsg.time = timeNow;
      } else {
        updatedMessages.push({
          id: "msg-" + updatedMessages.length,
          sender: "agent",
          senderName: "You",
          avatar: "YO",
          time: timeNow,
          bubbles: [newBubbleText]
        });
      }

      const updatedChat = {
        ...activeChat,
        messages: updatedMessages,
        snippet: newBubbleText.substring(0, 30),
        time: timeNow
      };

      setChats(prev => {
        const isPinned = prev.pinned.some(c => c.id === activeId);
        if (isPinned) {
          return {
            ...prev,
            pinned: prev.pinned.map(c => c.id === activeId ? updatedChat : c)
          };
        } else {
          return {
            ...prev,
            recent: prev.recent.map(c => c.id === activeId ? updatedChat : c)
          };
        }
      });

      setInputText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Column: Chat Sessions List */}
      <div className={styles.chatListCol}>
        {/* Pinned Section */}
        <div className={styles.sectionHeader}>
          <span className={styles.headerLeft}>
            <span>📌</span> Pinned
          </span>
          <span className={styles.chevron}>▲</span>
        </div>
        <div>
          {chats.pinned.length > 0 ? chats.pinned.map(chat => (
            <div 
              key={chat.id} 
              className={`${styles.chatItem} ${activeId === chat.id ? styles.chatItemActive : ''}`}
              onClick={() => setActiveId(chat.id)}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>{chat.initials}</div>
                <span className={styles.flagIcon}>{chat.flag}</span>
              </div>
              <div className={styles.itemMain}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{chat.name}</span>
                  <span className={styles.itemTime}>{chat.time}</span>
                </div>
                <p className={styles.itemSnippet}>{chat.snippet}</p>
              </div>
              <div className={styles.itemRight}>
                {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
                <span className={styles.pinIcon}>📌</span>
              </div>
            </div>
          )) : (
            <div className={styles.emptyListContainer} style={{ padding: "20px" }}>
              <p className={styles.emptyListText}>No pinned conversations</p>
            </div>
          )}
        </div>

        {/* Recent Conversations Section */}
        <div className={styles.sectionHeader}>
          <span className={styles.headerLeft}>
            <span>💬</span> Recent Conversations
          </span>
          <span className={styles.chevron}>▲</span>
        </div>
        <div>
          {chats.recent.length > 0 ? chats.recent.map(chat => (
            <div 
              key={chat.id} 
              className={`${styles.chatItem} ${activeId === chat.id ? styles.chatItemActive : ''}`}
              onClick={() => setActiveId(chat.id)}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>{chat.initials}</div>
                <span className={styles.flagIcon}>{chat.flag}</span>
              </div>
              <div className={styles.itemMain}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{chat.name}</span>
                  <span className={styles.itemTime}>{chat.time}</span>
                </div>
                <p className={styles.itemSnippet}>{chat.snippet}</p>
              </div>
              <div className={styles.itemRight}>
                {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
              </div>
            </div>
          )) : (
            <div className={styles.emptyListContainer}>
              <div className={styles.emptyListIconBox}>
                <svg className={styles.emptyListIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className={styles.emptyListTitle}>No active chats</h3>
              <p className={styles.emptyListText}>When users start a live chat, they will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat Content Pane */}
      {activeChat ? (
        <div className={styles.chatContent}>
          <div className={styles.chatHeader}>
            <div className={styles.headerAvatar}>{activeChat.initials}</div>
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{activeChat.name}</span>
              <span className={styles.headerStatus}>● Active Now</span>
            </div>
          </div>

          <div className={styles.messagePane}>
            {activeChat.messages.map((group) => {
              const isAgent = group.sender === "agent";
              const isSpecial = group.sender === "special";
              
              return (
                <div 
                  key={group.id} 
                  className={`${styles.messageGroup} ${isAgent ? styles.messageGroupRight : styles.messageGroupLeft}`}
                >
                  <div className={styles.msgAvatar}>{group.avatar}</div>
                  <div className={styles.msgContentCol}>
                    <div className={`${styles.msgHeaderRow} ${isAgent ? styles.msgHeaderRowRight : ''}`}>
                      <span className={styles.msgSenderName}>{group.senderName}</span>
                      <span className={styles.msgTime}>{group.time}</span>
                    </div>
                    <div className={styles.bubblesList}>
                      {group.bubbles.map((text, idx) => (
                        <div 
                          key={idx} 
                          className={`
                            ${styles.bubble} 
                            ${isAgent ? styles.bubbleRight : isSpecial ? styles.bubbleSpecial : styles.bubbleLeft}
                          `}
                        >
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* High-Fidelity Themed Custom Reply Box */}
          <div className={styles.replyBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.replyHeader}>
              <span className={styles.replyCc} onClick={() => setShowCcPopover(!showCcPopover)}>CC</span>
            </div>
            
            {/* CC Floating Popover Settings */}
            {showCcPopover && (
              <div className={styles.ccPopover}>
                <h4 className={styles.popoverTitle}>CC Settings</h4>
                <div className={styles.popoverField}>
                  <label className={styles.popoverLabel}>Add user to conversation:</label>
                  <input 
                    type="text" 
                    className={styles.popoverInput}
                    placeholder="Username, e.g. @poet"
                    value={ccUsername}
                    onChange={(e) => setCcUsername(e.target.value)}
                  />
                </div>
                <div className={styles.popoverRow}>
                  <input 
                    type="checkbox" 
                    id="cc-email-notify" 
                    className={styles.popoverCheckbox}
                    checked={ccEmailNotify}
                    onChange={(e) => setCcEmailNotify(e.target.checked)}
                  />
                  <label htmlFor="cc-email-notify" className={styles.popoverCheckboxLabel}>
                    Send email notification on file
                  </label>
                </div>
              </div>
            )}

            <textarea 
              className={styles.textarea}
              placeholder={`Send message to ${activeChat.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <div className={styles.replyToolbar}>
              <div className={styles.tools}>
                <svg className={styles.toolIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <svg className={styles.toolIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <svg className={styles.toolIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                <svg className={styles.toolIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <svg className={styles.toolIcon} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </div>
              <button className={styles.sendBtn} onClick={handleSend}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateGraphic}>
            <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No Chat Selected</h2>
          <p className={styles.emptyStateText}>
            Select a conversation from the left panel to start chatting and assist users in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
