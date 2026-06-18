"use client";

import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";

const INITIAL_CHATS = {
  pinned: [
    {
      id: "ariana",
      name: "Ariana Grande",
      time: "02:23",
      snippet: "Hey, I just signed up for your...",
      unread: 2,
      pinned: true,
      initials: "AG",
      flag: "🇺🇸",
      messages: [
        {
          id: "m1",
          sender: "user",
          senderName: "Ariana Grande",
          avatar: "AG",
          time: "02:23",
          bubbles: [
            "Hey, I just signed up for your platform.",
            "I love the poetry themes so far!"
          ]
        }
      ]
    },
    {
      id: "david",
      name: "David Miller",
      time: "02:40",
      snippet: "Hey Ariana Grande 👋...",
      unread: 0,
      pinned: true,
      initials: "DM",
      flag: "🇿🇦",
      messages: [
        {
          id: "dm1",
          sender: "user",
          senderName: "David Miller",
          avatar: "DM",
          time: "02:40",
          bubbles: [
            "Hey,",
            "I just signed up for your platform.",
            "I'm trying to understand how the AI actually handles customer queries. Does it reply automatically or just suggest replies?"
          ]
        },
        {
          id: "dm2",
          sender: "agent",
          senderName: "You",
          avatar: "YO",
          time: "02:42",
          bubbles: [
            "Hello David! 👋",
            "Great question — the AI can do both."
          ]
        },
        {
          id: "dm3",
          sender: "special",
          senderName: "David Miller",
          avatar: "DM",
          time: "02:45",
          bubbles: [
            "It can automatically respond to common queries, or assist your team by suggesting replies you can review before sending.",
            "Would you like help setting up automation?"
          ]
        },
        {
          id: "dm4",
          sender: "user",
          senderName: "Harry Brooks",
          avatar: "HB",
          time: "03:45",
          bubbles: [
            "Adding to that — most teams start with AI suggestions first, then enable full automation once they're confident.",
            "What kind of support requests do you usually get?"
          ]
        },
        {
          id: "dm5",
          sender: "agent",
          senderName: "You",
          avatar: "YO",
          time: "03:52",
          bubbles: [
            "Mostly onboarding questions and billing issues. Around 200 tickets a week."
          ]
        },
        {
          id: "dm6",
          sender: "user",
          senderName: "David Miller",
          avatar: "DM",
          time: "03:59",
          bubbles: [
            "Usually under 15 minutes for basic setup.",
            "If you want, I can help you set up your first AI workflow right now."
          ]
        }
      ]
    },
    {
      id: "emma",
      name: "Emma Watson",
      time: "02:51",
      snippet: "Adding to that — most team...",
      unread: 3,
      pinned: true,
      initials: "EW",
      flag: "🇬🇧",
      messages: [
        {
          id: "ew1",
          sender: "user",
          senderName: "Emma Watson",
          avatar: "EW",
          time: "02:51",
          bubbles: [
            "Adding to that — most teams start with..."
          ]
        }
      ]
    }
  ],
  recent: [
    {
      id: "natalie",
      name: "Natalie Portman",
      time: "03:15",
      snippet: "In our experience, the user feedb...",
      unread: 2,
      pinned: false,
      initials: "NP",
      flag: "🇫🇷",
      messages: [
        {
          id: "np1",
          sender: "user",
          senderName: "Natalie Portman",
          avatar: "NP",
          time: "03:15",
          bubbles: [
            "In our experience, the user feedback has been great."
          ]
        }
      ]
    },
    {
      id: "harry",
      name: "Harry Brooks",
      time: "03:45",
      snippet: "Adding to that — most teams start with...",
      unread: 0,
      pinned: false,
      initials: "HB",
      flag: "🇸🇰",
      messages: [
        {
          id: "hb1",
          sender: "user",
          senderName: "Harry Brooks",
          avatar: "HB",
          time: "03:45",
          bubbles: [
            "Adding to that — most teams start with..."
          ]
        }
      ]
    },
    {
      id: "scarlett",
      name: "Scarlett Johansson",
      time: "04:02",
      snippet: "It's crucial to balance automation and h...",
      unread: 0,
      pinned: false,
      initials: "SJ",
      flag: "🇩🇪",
      messages: [
        {
          id: "sj1",
          sender: "user",
          senderName: "Scarlett Johansson",
          avatar: "SJ",
          time: "04:02",
          bubbles: [
            "It's crucial to balance automation and human support."
          ]
        }
      ]
    },
    {
      id: "tom",
      name: "Tom Holland",
      time: "03:30",
      snippet: "We receive numerous inquiries a...",
      unread: 3,
      pinned: false,
      initials: "TH",
      flag: "🇮🇹",
      messages: [
        {
          id: "th1",
          sender: "user",
          senderName: "Tom Holland",
          avatar: "TH",
          time: "03:30",
          bubbles: [
            "We receive numerous inquiries every day about formatting."
          ]
        }
      ]
    },
    {
      id: "gal",
      name: "Gal Gadot",
      time: "02:20",
      snippet: "Users often ask about customiza...",
      unread: 2,
      pinned: false,
      initials: "GG",
      flag: "🇮🇱",
      messages: [
        {
          id: "gg1",
          sender: "user",
          senderName: "Gal Gadot",
          avatar: "GG",
          time: "02:20",
          bubbles: [
            "Users often ask about customization."
          ]
        }
      ]
    }
  ]
};

export default function SupportChat() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeId, setActiveId] = useState("david");
  const [inputText, setInputText] = useState("");

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

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const newBubbleText = inputText;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update active chat messages
    const updatedMessages = [...activeChat.messages];
    const lastMsg = updatedMessages[updatedMessages.length - 1];

    if (lastMsg && lastMsg.sender === "agent") {
      // Append to consecutive agent bubble stack
      lastMsg.bubbles = [...lastMsg.bubbles, newBubbleText];
      lastMsg.time = timeNow;
    } else {
      // Start a new group
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
      snippet: newBubbleText,
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
          {chats.pinned.map(chat => (
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
          ))}
        </div>

        {/* Recent Conversations Section */}
        <div className={styles.sectionHeader}>
          <span className={styles.headerLeft}>
            <span>💬</span> Recent Conversations
          </span>
          <span className={styles.chevron}>▲</span>
        </div>
        <div>
          {chats.recent.map(chat => (
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
          ))}
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
        <div className={styles.chatContent} style={{ alignItems: "center", justifyContent: "center", color: "#888" }}>
          Select a chat thread to view details
        </div>
      )}
    </div>
  );
}
