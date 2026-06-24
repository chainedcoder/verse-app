"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import styles from "./Tickets.module.css";
import { TICKETS_DATA } from "./mockData";
import { useSession } from "next-auth/react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const transformTicketData = (backendTickets) => {
  return backendTickets.map(t => {
    const rawDate = new Date(t.createdAt);
    const messages = t.thread?.messages || [];
    
    // Group messages by sender into bubbles
    const groupedMessages = [];
    let currentGroup = null;

    messages.forEach(msg => {
      const isAgent = msg.senderType === "agent" || msg.senderType === "system";
      const senderKey = isAgent ? "agent" : "user";
      
      let parsedContent = [];
      try {
        parsedContent = JSON.parse(msg.content);
        if (!Array.isArray(parsedContent)) parsedContent = [msg.content];
      } catch (e) {
        parsedContent = [msg.content];
      }

      if (!currentGroup || currentGroup.sender !== senderKey) {
        currentGroup = {
          id: msg.id,
          sender: senderKey,
          senderName: isAgent ? "You" : (t.reporter?.name || "User"),
          avatar: isAgent ? "YO" : (t.reporter?.name ? t.reporter.name.substring(0, 2).toUpperCase() : "US"),
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bubbles: [...parsedContent]
        };
        groupedMessages.push(currentGroup);
      } else {
        currentGroup.bubbles.push(...parsedContent);
      }
    });

    return {
      id: t.id,
      status: t.status,
      time: rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: t.title,
      snippet: t.snippet,
      pinned: t.thread?.pinned || false,
      unread: 0,
      read: true,
      reporter: {
        name: t.reporter?.name || "Unknown",
        initials: t.reporter?.name ? t.reporter.name.substring(0, 2).toUpperCase() : "U",
        email: t.reporter?.email || "",
      },
      date: rawDate.toLocaleDateString(),
      rawDate: rawDate.toISOString(),
      requestType: t.requestType,
      entityDetail: t.entityName ? {
        type: t.entityType || "Entity",
        id: t.entityId || "N/A",
        name: t.entityName,
      } : null,
      assignee: t.assignee ? {
        id: t.assignee.id,
        name: t.assignee.name || t.assignee.email || "Unknown",
        initials: (t.assignee.name || "A").substring(0, 2).toUpperCase()
      } : null,
      messages: groupedMessages,
      timestamp: rawDate.toLocaleString(),
      threadId: t.threadId
    };
  });
};

const getTagClass = (status) => {
  if (status === "New") return styles.tagNew;
  if (status === "Open") return styles.tagOpen;
  if (status === "Pending") return styles.tagPending;
  return styles.tagClosed;
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role || "USER";
  const isUser = currentUserRole === "USER";

  const [activeTickets, setActiveTickets] = useState(TICKETS_DATA);
  const [activeTabs, setActiveTabs] = useState([TICKETS_DATA[0], TICKETS_DATA[2], TICKETS_DATA[1], TICKETS_DATA[15], TICKETS_DATA[14]]);
  const [activeTabId, setActiveTabId] = useState(TICKETS_DATA[0].id);

  const [mobileView, setMobileView] = useState("list"); // "list", "chat", "info"
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
      const width = isTestEnv ? 1200 : window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1100);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When activeTabId changes on mobile, we automatically switch to the 'chat' view
  useEffect(() => {
    if (activeTabId && isMobile) {
      setMobileView("chat");
    }
  }, [activeTabId, isMobile]);

  // Hide the global admin sidebar hamburger button when deep in chat/info view on mobile
  useEffect(() => {
    if (isMobile && mobileView !== "list") {
      document.body.classList.add("hide-admin-sidebar");
    } else {
      document.body.classList.remove("hide-admin-sidebar");
    }
    return () => {
      document.body.classList.remove("hide-admin-sidebar");
    };
  }, [mobileView, isMobile]);

  // Persist session-level tab state
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (activeTabId) {
          sessionStorage.setItem("support_active_tab_id", activeTabId);
        } else {
          sessionStorage.removeItem("support_active_tab_id");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTabId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (activeTabs.length > 0) {
          const tabIds = activeTabs.map(t => t.id);
          sessionStorage.setItem("support_active_tabs", JSON.stringify(tabIds));
        } else {
          sessionStorage.removeItem("support_active_tabs");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTabs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("support_mobile_view", mobileView);
      } catch (e) {
        console.error(e);
      }
    }
  }, [mobileView]);
  
  // Restore active tabs and ID from sessionStorage on mount!
  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

    if (typeof window !== "undefined") {
      try {
        const storedTabId = sessionStorage.getItem("support_active_tab_id");
        const storedTabsRaw = sessionStorage.getItem("support_active_tabs");
        const storedMobileView = sessionStorage.getItem("support_mobile_view");
        
        fetch("/api/admin/tickets")
          .then(res => res.json())
          .then(data => {
            if (data.tickets) {
              const transformed = transformTicketData(data.tickets);
              
              if (storedTabsRaw) {
                const parsedIds = JSON.parse(storedTabsRaw);
                const restoredTabs = transformed.filter(t => parsedIds.includes(t.id));
                setActiveTabs(restoredTabs);
              } else {
                setActiveTabs([]);
              }
              
              if (storedTabId) {
                const hasMatch = transformed.some(t => t.id === storedTabId);
                if (hasMatch) {
                  setActiveTabId(storedTabId);
                  const isMob = window.innerWidth < 768;
                  if (isMob && storedMobileView) {
                    setMobileView(storedMobileView);
                  }
                }
              } else {
                setActiveTabId(null);
                const isMob = window.innerWidth < 768;
                if (isMob) {
                  setMobileView("list");
                }
              }
            }
          }).catch(console.error);
      } catch (e) {
        console.error("Error restoring session state:", e);
      }
    }
  }, []);

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

    fetch("/api/admin/tickets")
      .then(res => res.json())
      .then(data => {
        if (data.tickets) {
          const transformed = transformTicketData(data.tickets);
          setActiveTickets(transformed);
        }
      })
      .catch(console.error);
  }, []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "open", "closed"
  const [groupBy, setGroupBy] = useState("category"); // "category", "type", "none"
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc", "date-asc", "name", "type"
  const [replyText, setReplyText] = useState("Hi there,\n\nThank you for reaching out to Verse Support. I've taken a look at your request and reviewed the details.\n\nEverything looks in order now. We've updated the status on our end. Please let us know if there is anything else we can assist you with!\n\nBest regards,\nVerse Customer Care");
  const [showToast, setShowToast] = useState("");
  const [showExpandModal, setShowExpandModal] = useState(false);

  // Custom styled dropdown state variables
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Create Ticket Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isUser && session?.user && !selectedUser) {
      setSelectedUser({
        id: session.user.id,
        name: session.user.name || session.user.email || "You",
        email: session.user.email || ""
      });
    }
  }, [isUser, session, selectedUser]);
  const [newTicketForm, setNewTicketForm] = useState({ title: "", snippet: "", category: "General", priority: "Medium", entityType: "Post", entityId: "", entityName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Entity Search State
  const [showEntityMenu, setShowEntityMenu] = useState(false);
  const [entityQuery, setEntityQuery] = useState("");
  const [entityResults, setEntityResults] = useState([]);
  const [isSearchingEntity, setIsSearchingEntity] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Search users effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "" || selectedUser) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
           setSearchResults(data.users || []);
           setIsSearching(false);
        }).catch(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedUser]);

  // Search entities effect
  useEffect(() => {
    if (!entityQuery || entityQuery.trim() === "" || selectedEntity) {
      setEntityResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearchingEntity(true);
      fetch(`/api/admin/entities/search?model=${newTicketForm.entityType}&q=${encodeURIComponent(entityQuery)}`)
        .then(res => res.json())
        .then(data => {
           setEntityResults(data.entities || []);
           setIsSearchingEntity(false);
        }).catch(() => setIsSearchingEntity(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [entityQuery, newTicketForm.entityType, selectedEntity]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newTicketForm.title.trim() || !newTicketForm.snippet.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/tickets", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            targetUserId: selectedUser.id,
            ...newTicketForm,
            entityId: selectedEntity?.id || "",
            entityName: selectedEntity?.name || ""
         })
      });
      if (res.ok) {
         setShowCreateModal(false);
         setNewTicketForm({ title: "", snippet: "", category: "General", priority: "Medium", entityType: "Post", entityId: "", entityName: "" });
         setSelectedUser(null);
         setSelectedEntity(null);
         setEntityQuery("");
         setSearchQuery("");
         setShowToast("Ticket created successfully!");
         setTimeout(() => setShowToast(""), 3000);
         
         // Refetch tickets
         fetch("/api/admin/tickets")
           .then(r => r.json())
           .then(data => {
             if (data.tickets) {
               const transformed = transformTicketData(data.tickets);
               setActiveTickets(transformed);
             }
           }).catch(console.error);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  // Settings & Toggling
  const [contextMenu, setContextMenu] = useState(null); // { x: 0, y: 0, ticketId: "" }
  const [urlTicketId, setUrlTicketId] = useState(null);

  // Assignment State
  const [agents, setAgents] = useState([]);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  // Status State
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Timeline State
  const [ticketLogs, setTicketLogs] = useState([]);

  // CC State
  const [showCcModal, setShowCcModal] = useState(false);
  const [ccSearchQuery, setCcSearchQuery] = useState("");
  const [ccSearchResults, setCcSearchResults] = useState([]);
  const [isSearchingCc, setIsSearchingCc] = useState(false);

  // Pagination / Limit State
  const [recentLimit, setRecentLimit] = useState(3);
  const [unresolvedLimit, setUnresolvedLimit] = useState(5);
  const [resolvedLimit, setResolvedLimit] = useState(5);

  // Resize state
  const [rightPaneWidth, setRightPaneWidth] = useState(320);
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false);

  useEffect(() => {
    if (isTablet) {
      setIsRightPaneCollapsed(true);
    } else if (!isMobile) {
      setIsRightPaneCollapsed(false);
    }
  }, [isTablet, isMobile]);
  const [preCollapseWidth, setPreCollapseWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (ccSearchQuery.length < 2) {
      setCcSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearchingCc(true);
      try {
        const res = await fetch(`/api/admin/entities/search?model=User&q=${encodeURIComponent(ccSearchQuery)}`);
        const data = await res.json();
        setCcSearchResults(data.entities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCc(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [ccSearchQuery]);

  const handleCcUser = async (user) => {
    if (!activeTicket) return;
    try {
      const res = await fetch(`/api/admin/tickets/${activeTicket.id}/cc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to CC user");
      }
      setShowToast(`Successfully CC'd ${user.name || user.email}`);
      setShowCcModal(false);
      setCcSearchQuery("");
      // Refresh logs
      fetch(`/api/admin/tickets/${activeTicket.id}/logs`)
        .then(r => r.json())
        .then(data => {
          if (data.logs) setTicketLogs(data.logs);
        }).catch(console.error);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Parse query parameter ?id=128 (Sets focused view)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setTimeout(() => {
          setUrlTicketId(id);
          setActiveTabId(id);
          const ticketObj = activeTickets.find(t => t.id === id);
          if (ticketObj) {
            setActiveTabs([ticketObj]);
          }
        }, 0);
      }
    }
  }, [activeTickets]);

  // Listen to outer window clicks to close right-click context menu and dropdown menus
  useEffect(() => {
    const closeContext = () => {
      setContextMenu(null);
      setShowGroupMenu(false);
      setShowSortMenu(false);
      setShowCategoryMenu(false);
      setShowPriorityMenu(false);
      setShowEntityMenu(false);
      setShowAssignMenu(false);
    };
    window.addEventListener("click", closeContext);
    return () => window.removeEventListener("click", closeContext);
  }, []);

  const activeTicket = activeTabs.find(t => t.id === activeTabId);

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

    fetch("/api/admin/agents")
      .then(r => r.json())
      .then(data => {
        if (data.agents) setAgents(data.agents);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

    if (!activeTicket) return;
    setTicketLogs([]);
    fetch(`/api/admin/tickets/${activeTicket.id}/logs`)
      .then(r => r.json())
      .then(data => {
        if (data.logs) {
          setTicketLogs(data.logs);
        } else {
          setTicketLogs([]);
        }
      }).catch(err => {
        console.error(err);
        setTicketLogs([]);
      });
  }, [activeTicket?.id]);

  const handleAssign = async (e, agentId) => {
    e.stopPropagation();
    setShowAssignMenu(false);
    try {
      const res = await fetch(`/api/admin/tickets/${activeTicket.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: agentId })
      });
      if (res.ok) {
        setShowToast("Ticket assigned successfully!");
        setTimeout(() => setShowToast(""), 3000);
        
        const selectedAgent = agents.find(a => a.id === agentId);
        if (selectedAgent) {
           const updatedTickets = activeTickets.map(t => {
             if (t.id === activeTicket.id) {
               return { 
                 ...t, 
                 assignee: { 
                   id: selectedAgent.id,
                   name: selectedAgent.name || selectedAgent.email, 
                   initials: (selectedAgent.name || "A").substring(0, 2).toUpperCase() 
                 } 
               };
             }
             return t;
           });
           setActiveTickets(updatedTickets);
           setActiveTabs(prev => prev.map(t => t.id === activeTicket.id ? updatedTickets.find(ut => ut.id === activeTicket.id) : t));
        }

        // Refresh logs
        fetch(`/api/admin/tickets/${activeTicket.id}/logs`)
          .then(r => r.json())
          .then(data => {
            if (data.logs) setTicketLogs(data.logs);
          }).catch(console.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    if (!activeTicket) return;
    try {
      const res = await fetch(`/api/admin/tickets/${activeTicket.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      const updatedTicket = { ...activeTicket, status: newStatus };
      const updatedTickets = activeTickets.map(t => t.id === activeTicket.id ? updatedTicket : t);
      setActiveTickets(updatedTickets);
      
      // Refresh logs
      fetch(`/api/admin/tickets/${activeTicket.id}/logs`)
        .then(r => r.json())
        .then(data => {
          if (data.logs) setTicketLogs(data.logs);
        }).catch(console.error);

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
    setShowStatusMenu(false);
  };

  const handleSend = async () => {
    if (!replyText.trim() || !activeTicket) return;

    try {
      const payload = {
        content: JSON.stringify([replyText]),
        senderType: "agent"
      };

      const res = await fetch(`/api/admin/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error("Failed to send message: " + (errData.error || res.statusText));
      }

      // Refetch or optimistically update
      const newReplyText = replyText;
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedTickets = activeTickets.map(t => {
      if (t.id === activeTicket.id) {
        const updatedMessages = [...t.messages];
        const lastMsg = updatedMessages[updatedMessages.length - 1];

        if (lastMsg && lastMsg.sender === "agent") {
          lastMsg.bubbles = [...lastMsg.bubbles, newReplyText];
          lastMsg.time = timeNow;
        } else {
          updatedMessages.push({
            id: "msg-" + updatedMessages.length,
            sender: "agent",
            senderName: "You",
            avatar: "YO",
            time: timeNow,
            bubbles: [newReplyText]
          });
        }
        return {
          ...t,
          messages: updatedMessages,
          read: true,
          unread: 0
        };
      }
      return t;
    });

      setActiveTickets(updatedTickets);
      
      const currentUpdatedTicket = updatedTickets.find(t => t.id === activeTicket.id);
      setActiveTabs(prev => prev.map(t => t.id === activeTicket.id ? currentUpdatedTicket : t));

      // Refresh logs
      fetch(`/api/admin/tickets/${activeTicket.id}/logs`)
        .then(r => r.json())
        .then(data => {
          if (data.logs) setTicketLogs(data.logs);
        }).catch(console.error);

      setShowToast("Message sent successfully!");
      setReplyText("");
      setTimeout(() => setShowToast(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Filter Logic (Search text + Open/Closed filter)
  const filteredTickets = activeTickets.filter(t => {
    const matchesSearch = (t.title || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.snippet || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.reporter?.name || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "open") return t.status !== "Closed";
    if (filter === "closed") return t.status === "Closed";
    return true;
  });

  // 2. Comparator function based on sortBy
  const getSortComparator = () => {
    if (sortBy === "date-desc") {
      return (a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
    }
    if (sortBy === "date-asc") {
      return (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
    }
    if (sortBy === "name") {
      return (a, b) => a.reporter.name.localeCompare(b.reporter.name);
    }
    if (sortBy === "type") {
      return (a, b) => a.requestType.localeCompare(b.requestType);
    }
    return () => 0;
  };

  const comparator = getSortComparator();

  // 3. Sectioning and Rendering Logic based on groupBy
  let listContentToRender = null;

  if (groupBy === "category") {
    // CATEGORIZED DATE VIEW (Default Sections)
    const pinnedTickets = filteredTickets.filter(t => t.pinned).sort(comparator);
    const recentTickets = filteredTickets.filter(t => !t.pinned).sort(comparator);
    const displayedRecentIds = new Set(recentTickets.slice(0, recentLimit).map(t => t.id));
    const pinnedIds = new Set(pinnedTickets.map(t => t.id));

    const unresolvedTickets = filteredTickets
      .filter(t => t.status !== "Closed" && !pinnedIds.has(t.id) && !displayedRecentIds.has(t.id))
      .sort(comparator);
    const resolvedTickets = filteredTickets
      .filter(t => t.status === "Closed" && !pinnedIds.has(t.id) && !displayedRecentIds.has(t.id))
      .sort(comparator);

    listContentToRender = (
      <>
        {/* Pinned Section */}
        {pinnedTickets.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.headerLeft}>📌 Pinned</span>
              <span className={styles.chevron}>▲</span>
            </div>
            {pinnedTickets.map(ticket => renderTicketItem(ticket))}
          </>
        )}

        {/* Recent Section (Max 3, expands to 13) */}
        {recentTickets.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.headerLeft}>💬 Recent Conversations</span>
              <span className={styles.chevron}>▲</span>
            </div>
            {recentTickets.slice(0, recentLimit).map(ticket => renderTicketItem(ticket))}
            {recentTickets.length > recentLimit && (
              <div className={styles.btnRow}>
                <button className={styles.moreBtn} onClick={() => setRecentLimit(recentLimit + 10)}>Show More</button>
              </div>
            )}
          </>
        )}

        {/* Unresolved / Open Section (Max 5, expands) */}
        {unresolvedTickets.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.headerLeft}>⚠️ Unresolved Tickets</span>
              <span className={styles.chevron}>▲</span>
            </div>
            {unresolvedTickets.slice(0, unresolvedLimit).map(ticket => renderTicketItem(ticket))}
            {(unresolvedTickets.length > unresolvedLimit) && (
              <div className={styles.btnRow}>
                <button className={styles.moreBtn} onClick={() => setUnresolvedLimit(unresolvedLimit + 10)}>Show More</button>
                <button className={styles.allBtn} onClick={() => setUnresolvedLimit(999)}>Show All</button>
              </div>
            )}
          </>
        )}

        {/* Resolved / Closed Section (Max 5, expands) */}
        {resolvedTickets.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.headerLeft}>✅ Resolved Tickets</span>
              <span className={styles.chevron}>▲</span>
            </div>
            {resolvedTickets.slice(0, resolvedLimit).map(ticket => renderTicketItem(ticket))}
            {(resolvedTickets.length > resolvedLimit) && (
              <div className={styles.btnRow}>
                <button className={styles.moreBtn} onClick={() => setResolvedLimit(resolvedLimit + 10)}>Show More</button>
                <button className={styles.allBtn} onClick={() => setResolvedLimit(999)}>Show All</button>
              </div>
            )}
          </>
        )}
      </>
    );
  } else if (groupBy === "type") {
    // COMBINATION VIEW (Category by Request Type, sorted by selected sortBy comparator)
    const types = [...new Set(filteredTickets.map(t => t.requestType))].sort();
    listContentToRender = types.map(type => {
      const ticketsOfType = filteredTickets.filter(t => t.requestType === type).sort(comparator);
      return (
        <div key={type}>
          <div className={styles.sectionHeader}>
            <span className={styles.headerLeft}>📁 {type} Requests</span>
            <span className={styles.chevron}>▲</span>
          </div>
          {ticketsOfType.map(ticket => renderTicketItem(ticket))}
        </div>
      );
    });
  } else {
    // FLAT LIST VIEW (No Sections/Categories, fully sorted by selected sortBy comparator)
    const flatSorted = [...filteredTickets].sort(comparator);
    listContentToRender = flatSorted.map(ticket => renderTicketItem(ticket));
  }

  // Right-Click Context Menu Trigger on Ticket list Card
  const handleContextMenu = (e, ticketId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      ticketId
    });
  };

  function renderTicketItem(ticket) {
    const isSelected = activeTabId === ticket.id;
    return (
      <div 
        key={ticket.id}
        className={`${styles.ticketItem} ${isSelected ? styles.ticketItemActive : ''}`}
        onClick={() => handleTicketClick(ticket)}
        onContextMenu={(e) => handleContextMenu(e, ticket.id)}
      >
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{ticket.reporter.initials}</div>
        </div>
        <div className={styles.itemMain}>
          <div className={styles.itemTop}>
            <span className={`${styles.tag} ${getTagClass(ticket.status)}`}>{ticket.status}</span>
            <span className={styles.itemTime}>{ticket.time}</span>
          </div>
          <p className={styles.itemName} style={{ marginTop: '4px', fontWeight: '600' }}>{ticket.title}</p>
          <p className={styles.itemSnippet} style={{ marginTop: '2px' }}>{ticket.snippet}</p>
        </div>
        <div className={styles.itemRight}>
          {ticket.unread > 0 && <span className={styles.badge}>{ticket.unread}</span>}
          {ticket.pinned && <span className={styles.pinIcon}>📌</span>}
        </div>
      </div>
    );
  }

  // STANDARD CLICK: Replaces the current active tab's ticket (or single view)
  const handleTicketClick = (ticket) => {
    if (isMobile) {
      setMobileView("chat");
    }
    
    const updatedTickets = activeTickets.map(t => {
      if (t.id === ticket.id) {
        return { ...t, read: true, unread: 0 };
      }
      return t;
    });
    setActiveTickets(updatedTickets);

    const clickedTicket = updatedTickets.find(t => t.id === ticket.id);

    // If the ticket is already open in one of the tabs, just switch focus to it!
    const alreadyExists = activeTabs.some(t => t.id === ticket.id);
    if (alreadyExists) {
      setActiveTabId(ticket.id);
      return;
    }

    if (activeTabs.length <= 1 || !activeTabId) {
      // Single view/replace mode
      setActiveTabs([clickedTicket]);
    } else {
      // Replaces the currently active tab inside the tabs strip!
      setActiveTabs(prev => prev.map(t => t.id === activeTabId ? clickedTicket : t));
    }
    setActiveTabId(ticket.id);
  };

  // RIGHT CLICK ➔ "Open in New Tab" (Forcibly opens as a new separate app tab!)
  const handleOpenSpecificNewTab = (ticketId) => {
    const clickedTicket = activeTickets.find(t => t.id === ticketId);
    if (clickedTicket) {
      const alreadyExists = activeTabs.some(t => t.id === ticketId);
      if (!alreadyExists) {
        setActiveTabs([...activeTabs, clickedTicket]);
      }
      setActiveTabId(ticketId);
    }
  };

  // RIGHT CLICK ➔ "Open in New Browser Tab" (Spawns a new independent browser tab!)
  const handleOpenNewBrowserWindow = (ticketId) => {
    window.open(`/admin/support/tickets?id=${ticketId}`, "_blank");
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    const newTabs = activeTabs.filter(t => t.id !== id);
    setActiveTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    } else if (newTabs.length === 0) {
      setActiveTabId(null);
    }
  };

  const handleCloseTicketView = () => {
    setActiveTabId(null);
    setActiveTabs([]);
    if (isMobile) {
      setMobileView("list");
    }
  };

  // Draggable Pane resizing
  const startResize = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const calculatedWidth = containerRect.right - e.clientX;
      
      if (calculatedWidth >= 200 && calculatedWidth <= 600) {
        setRightPaneWidth(calculatedWidth);
        setIsRightPaneCollapsed(false);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleCollapse = (e) => {
    e.stopPropagation();
    if (isRightPaneCollapsed) {
      setIsRightPaneCollapsed(false);
      setRightPaneWidth(preCollapseWidth);
    } else {
      setPreCollapseWidth(rightPaneWidth);
      setIsRightPaneCollapsed(true);
    }
  };

  // Determine if we should show the full browser-like tab bar (Show only if activeTabs.length > 1)
  const isTabModeActive = activeTabs.length > 1;

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Left Column: Ticket List formatted exactly as Modern Chat List (hidden if loaded focused via query param) */}
      {!urlTicketId && (!isMobile || mobileView === "list") && (
        <div className={styles.ticketListCol} style={{ width: isMobile ? "100%" : "320px" }}>
          <div className={styles.listHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h1 className={styles.title} style={{ margin: 0 }}>Tickets</h1>
              <button className={styles.createTicketBtn} onClick={() => setShowCreateModal(true)}>
                + New Ticket
              </button>
            </div>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Pills: All / Open / Closed */}
          <div className={styles.filterPills}>
            <button className={`${styles.pill} ${filter === 'all' ? styles.pillActive : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`${styles.pill} ${filter === 'open' ? styles.pillActive : ''}`} onClick={() => setFilter('open')}>Open</button>
            <button className={`${styles.pill} ${filter === 'closed' ? styles.pillActive : ''}`} onClick={() => setFilter('closed')}>Closed</button>
          </div>

          {/* Sorting and Grouping Dropdown Menus */}
          <div className={styles.sortContainer}>
            <div className={styles.sortField}>
              <span className={styles.sortLabel}>Group:</span>
              <div className={styles.customDropdownContainer}>
                <button 
                  className={styles.customDropdownTrigger}
                  onClick={(e) => { e.stopPropagation(); setShowGroupMenu(!showGroupMenu); setShowSortMenu(false); }}
                >
                  {groupBy === "category" ? "Categories" : groupBy === "type" ? "Request Type" : "Flat List"}
                  <span className={styles.dropdownArrow}>▼</span>
                </button>
                {showGroupMenu && (
                  <div className={styles.customDropdownMenu}>
                    <div className={styles.customDropdownItem} onClick={() => { setGroupBy("category"); setShowGroupMenu(false); }}>Categories</div>
                    <div className={styles.customDropdownItem} onClick={() => { setGroupBy("type"); setShowGroupMenu(false); }}>Request Type</div>
                    <div className={styles.customDropdownItem} onClick={() => { setGroupBy("none"); setShowGroupMenu(false); }}>Flat List</div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sortField}>
              <span className={styles.sortLabel}>Sort:</span>
              <div className={styles.customDropdownContainer}>
                <button 
                  className={styles.customDropdownTrigger}
                  onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); setShowGroupMenu(false); }}
                >
                  {sortBy === "date-desc" ? "Date (Newest)" : sortBy === "date-asc" ? "Date (Oldest)" : sortBy === "name" ? "Name (A-Z)" : "Type (A-Z)"}
                  <span className={styles.dropdownArrow}>▼</span>
                </button>
                {showSortMenu && (
                  <div className={styles.customDropdownMenu}>
                    <div className={styles.customDropdownItem} onClick={() => { setSortBy("date-desc"); setShowSortMenu(false); }}>Date (Newest)</div>
                    <div className={styles.customDropdownItem} onClick={() => { setSortBy("date-asc"); setShowSortMenu(false); }}>Date (Oldest)</div>
                    <div className={styles.customDropdownItem} onClick={() => { setSortBy("name"); setShowSortMenu(false); }}>Name (A-Z)</div>
                    <div className={styles.customDropdownItem} onClick={() => { setSortBy("type"); setShowSortMenu(false); }}>Type (A-Z)</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.listContent}>
            {filteredTickets.length > 0 ? (
              listContentToRender
            ) : (
              <div className={styles.emptyListContainer}>
                <div className={styles.emptyListIconBox}>
                  <svg className={styles.emptyListIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={styles.emptyListTitle}>No tickets found</h3>
                <p className={styles.emptyListText}>Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Middle & Right Combined Main Panel */}
      {activeTicket && (!isMobile || mobileView === "chat" || mobileView === "info") ? (
        <div 
          className={styles.mainCombinedCol} 
          style={{ 
            margin: urlTicketId ? "0px" : "",
            borderLeft: isMobile ? "none" : "1px solid var(--border-primary)"
          }}
        >
          {/* Custom Mobile Header */}
          {isMobile && (
            <div className={styles.mobileHeader}>
              {mobileView === "chat" && (
                <div className={styles.mobileHeaderContent}>
                  <button className={styles.backBtn} onClick={() => setMobileView("list")}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>&lt; Tickets</span>
                  </button>
                  
                  <div className={styles.mobileHeaderTitleContainer}>
                    <div className={styles.mobileHeaderAvatar}>{activeTicket.reporter?.initials}</div>
                    <span className={styles.mobileHeaderTitle}>{activeTicket.title}</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button className={styles.infoBtn} onClick={() => setMobileView("info")} title="View Details">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                    <button className={styles.closeHeaderBtn} onClick={handleCloseTicketView} title="Close Ticket">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {mobileView === "info" && (
                <div className={styles.mobileHeaderContent}>
                  <button className={styles.backBtn} onClick={() => setMobileView("chat")}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>&lt; Chat</span>
                  </button>
                  <span className={styles.mobileHeaderTitle} style={{ textAlign: "center", flex: 1 }}>Ticket Details</span>
                  <button className={styles.closeHeaderBtn} onClick={() => setMobileView("chat")} title="Close details, go back to Chat">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Top: Sleek Browser-Like Tab strip (Shown ONLY if 2 or more tabs are open!) */}
          {!isMobile && isTabModeActive && (
            <div className={styles.tabsHeaderRow}>
              <div className={styles.tabsContainer}>
                {activeTabs.map(tab => (
                  <div 
                    key={tab.id} 
                    className={`${styles.tab} ${activeTabId === tab.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <div className={styles.tabAvatar}>{tab.reporter.initials}</div>
                    <span className={styles.tabText}>{tab.title}</span>
                    <span className={`${styles.tabDot} ${activeTabId === tab.id ? styles.tabDotActive : styles.tabDotInactive}`}></span>
                    <span className={styles.tabClose} onClick={(e) => closeTab(e, tab.id)}>×</span>
                  </div>
                ))}
              </div>
              {!isMobile && (
                <button 
                  className={styles.tabletInfoToggleBtn} 
                  onClick={() => setIsRightPaneCollapsed(!isRightPaneCollapsed)}
                  title="Toggle details panel"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '8px',
                    marginRight: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
              )}
            </div>
          )}
          {!isMobile && !isTabModeActive && (
            <div className={styles.threadHeaderRow} style={{ padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={styles.avatar}>{activeTicket.reporter?.initials}</div>
                <span className={styles.threadHeaderTitle} style={{ fontSize: '16px' }}>{activeTicket.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isMobile && (
                  <button 
                    className={styles.tabletInfoToggleBtn} 
                    onClick={() => setIsRightPaneCollapsed(!isRightPaneCollapsed)}
                    title="Toggle details panel"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                )}
                <button 
                  className={styles.desktopCloseBtn} 
                  onClick={handleCloseTicketView}
                  title="Close Ticket panel"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Bottom: Split screen (Left: Thread/Reply, Right: Metadata Panel, separated by Divider) */}
          <div className={styles.splitContentArea}>
            {(!isMobile || mobileView === "chat") && (
              <div className={styles.threadAndReplyContainer}>
              {/* Conversational Group Messages inside Thread */}
              <div className={styles.thread}>
                {activeTicket.snippet && (
                  <div className={`${styles.messageGroup} ${styles.messageGroupLeft}`}>
                    <div className={styles.msgAvatar}>{activeTicket.reporter?.initials}</div>
                    <div className={styles.msgContentCol}>
                      <div className={styles.msgHeaderRow}>
                        <span className={styles.msgSenderName}>{activeTicket.reporter?.name}</span>
                        <span className={styles.msgTime}>{activeTicket.time}</span>
                      </div>
                      <div className={styles.bubblesList}>
                        <div className={`${styles.bubble} ${styles.bubbleLeft}`}>{activeTicket.snippet}</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTicket.messages.map((group) => {
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
                              <div dangerouslySetInnerHTML={{ __html: text }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box below Thread */}
              <div className={styles.replyBox}>
                <div className={styles.replyHeader}>
                  <div className={styles.replyTo}>
                    <span>Reply To</span>
                    <span className={styles.replyBadge}>{activeTicket.reporter?.initials || "JD"}</span>
                    <span>{activeTicket.reporter?.email || "janedoe@mail.com"}</span>
                  </div>
                  {!isUser && (
                    <div className={styles.replyCcContainer} onClick={() => setShowCcModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.replyCc} style={{ color: 'var(--accent)', fontWeight: 500 }}>+ Add CC</span>
                    </div>
                  )}
                </div>
                <div className={styles.quillContainer}>
                  {typeof process !== "undefined" && process.env.NODE_ENV === "test" ? (
                    <textarea 
                      className={styles.textarea}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${activeTicket.reporter?.name || "User"}...`}
                      style={{ width: '100%', minHeight: '120px', padding: '16px', border: 'none', resize: 'none', outline: 'none', background: 'transparent' }}
                    />
                  ) : (
                    <ReactQuill 
                      theme="snow"
                      value={replyText}
                      onChange={setReplyText}
                      placeholder={`Reply to ${activeTicket.reporter?.name || "User"}...`}
                      style={{ height: '100px', marginBottom: '40px' }} // extra space for toolbar
                    />
                  )}
                </div>
                <div className={styles.replyToolbar} style={{ position: 'relative', borderTop: 'none', padding: '8px 24px', background: 'transparent' }}>
                  <div className={styles.tools}>
                    {/* Toolbar is now handled by React Quill, but we keep the custom CC/Attachment icons as props/actions if needed */}
                  </div>
                  <button className={styles.sendBtn} onClick={handleSend} style={{ position: 'absolute', right: '24px', bottom: '16px', zIndex: 10 }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Resizable Divider inside Split Content Area */}
            {!isMobile && !isTablet && (
              <div 
                className={`${styles.resizableDivider} ${isDragging ? styles.resizableDividerActive : ""}`} 
                onMouseDown={startResize}
              >
                <button className={styles.resizeHandleBtn} onClick={toggleCollapse} title={isRightPaneCollapsed ? "Expand Details" : "Collapse Details"}>
                  {isRightPaneCollapsed ? "«" : "»"}
                </button>
              </div>
            )}

            {/* Tablet Backdrop Overlay */}
            {isTablet && !isRightPaneCollapsed && (
              <div 
                className={styles.tabletBackdrop} 
                onClick={() => setIsRightPaneCollapsed(true)} 
              />
            )}

            {/* Right side Metadata column */}
            {(!isMobile || mobileView === "info") && (isTablet ? !isRightPaneCollapsed : true) && (
              <div 
                className={`${styles.metaCol} ${isTablet ? styles.tabletMetaCol : ""}`} 
                style={{ 
                  width: isMobile ? "100%" : (isTablet ? "380px" : (isRightPaneCollapsed ? "0px" : `${rightPaneWidth}px`)), 
                  overflow: "hidden",
                  borderLeft: isMobile ? "none" : "1px solid var(--border-primary)"
                }}
              >
              <div className={styles.metaSection}>
                <div className={styles.metaHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <h2 className={styles.metaTitle} style={{ margin: 0 }}>Ticket #{activeTicket.id}</h2>
                    {!isMobile && (
                      <button 
                        className={styles.tabletCloseDrawerBtn}
                        onClick={() => setIsRightPaneCollapsed(true)}
                        title="Collapse details panel"
                        style={{ marginLeft: "8px" }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className={styles.customDropdownContainer}>
                    <span 
                      className={`${styles.tag} ${getTagClass(activeTicket.status)}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isUser || activeTicket.status !== "Closed") {
                          setShowStatusMenu(!showStatusMenu); 
                        }
                      }}
                      style={{ cursor: (isUser && activeTicket.status === "Closed") ? 'default' : 'pointer' }}
                    >
                      {activeTicket.status} {(isUser && activeTicket.status === "Closed") ? "" : "▼"}
                    </span>
                    {showStatusMenu && (
                      <div className={styles.customDropdownMenu} style={{ top: '100%', left: 0, right: 0, marginTop: '4px' }}>
                        {(isUser ? ['Resolved', 'Closed'] : ['Open', 'In Progress', 'Resolved', 'Closed']).map(status => (
                          <div 
                            key={status}
                            className={`${styles.customDropdownItem} custom-select-option`}
                            onClick={(e) => handleStatusChange(e, status)}
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Date</span>
                  <span className={styles.metaValue}>{activeTicket.date || "Sept 20, 2024"}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Request Type</span>
                  <span className={styles.metaValue}>{activeTicket.requestType || "General"}</span>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <span className={styles.metaLabel} style={{ fontSize: '13px' }}>Assigned to</span>
                  <div className={styles.customDropdownContainer} style={{ width: '100%' }}>
                    <div 
                      className={styles.metaBox} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isUser) setShowAssignMenu(!showAssignMenu); 
                      }} 
                      style={{ cursor: isUser ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <div className={styles.metaAvatar} style={{ background: '#f0f0f0' }}>{activeTicket.assignee?.initials || "?"}</div>
                      <span>{activeTicket.assignee?.name || "Unassigned"}</span>
                      {!isUser && <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: '10px' }}>▼</span>}
                    </div>
                    {showAssignMenu && !isUser && (
                      <div className={styles.customDropdownMenu} style={{ top: '100%', left: 0, right: 0, marginTop: '4px' }}>
                        {agents.map(agent => (
                          <div 
                            key={agent.id}
                            className={styles.customDropdownItem} 
                            onClick={(e) => handleAssign(e, agent.id)}
                          >
                            {agent.name || agent.email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className={styles.metaLabel} style={{ fontSize: '13px' }}>Line Manager</span>
                  <div className={styles.metaBox}>
                    <div className={styles.metaAvatar} style={{ background: '#f0f0f0' }}>S</div>
                    <span>System Admin</span>
                  </div>
                </div>
              </div>

              {/* Optional Entity Details Section */}
              {activeTicket.entityDetail ? (
                <div className={styles.metaSection}>
                  <h3 className={styles.sectionTitle}>Entity Details</h3>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Entity Type</span>
                    <span className={styles.metaValue}>{activeTicket.entityDetail.type}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Entity ID</span>
                    <span className={styles.metaValue}>{activeTicket.entityDetail.id}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Name/Title</span>
                    <span className={styles.metaValue}>{activeTicket.entityDetail.name}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{activeTicket.entityDetail.extraLabel}</span>
                    <span className={styles.metaValue}>{activeTicket.entityDetail.extraValue}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>{activeTicket.entityDetail.statusLabel}</span>
                    <span className={styles.metaValue}>{activeTicket.entityDetail.statusValue}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.metaSection}>
                  <h3 className={styles.sectionTitle}>Entity Details</h3>
                  <div className={styles.metaRow} style={{ color: "#888", fontStyle: "italic" }}>
                    No linked entity for this request.
                  </div>
                </div>
              )}

              {/* Reporter Details Section */}
              <div className={styles.metaSection}>
                <h3 className={styles.sectionTitle}>Reporter Details</h3>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Name</span>
                  <span className={styles.metaValue}>{activeTicket.reporter?.name || "-"}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Email</span>
                  <span className={styles.metaValue}>{activeTicket.reporter?.email || "-"}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Phone Number</span>
                  <span className={styles.metaValue}>{activeTicket.reporter?.phone || "-"}</span>
                </div>
              </div>

              <div className={styles.metaSection} style={{ borderBottom: 'none' }}>
                <h3 className={styles.sectionTitle}>Progress</h3>
                <div className={styles.timeline}>
                  {ticketLogs.length > 0 ? ticketLogs.map(log => (
                    <div className={styles.timelineItem} key={log.id}>
                      <div className={styles.timelineIcon}>{log.actor?.name ? log.actor.name.substring(0, 2).toUpperCase() : "SY"}</div>
                      <div>
                        <div className={styles.timelineContent}>
                          {log.operation} <span style={{color:'var(--text-tertiary)', fontSize: '12px', marginLeft: '4px'}}>by {log.actor?.name || "System"}</span>
                        </div>
                        <div className={styles.timelineTime}>{new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No progress events yet.</div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateGraphic}>
            <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No Ticket Selected</h2>
          <p className={styles.emptyStateText}>
            Select a ticket from the list to view its details, conversation history, and more.
          </p>
        </div>
      )}

      {/* CC Modal */}
      {showCcModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCcModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>CC a User</h2>
              <button className={styles.closeBtn} onClick={() => setShowCcModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Search User (Name or Email)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Type to search..." 
                  value={ccSearchQuery}
                  onChange={(e) => setCcSearchQuery(e.target.value)}
                />
                {isSearchingCc && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Searching...</div>}
                {ccSearchResults.length > 0 && (
                  <div className={styles.searchResultContainer}>
                    {ccSearchResults.map(user => (
                      <div 
                        key={user.id} 
                        className={styles.searchResultItem}
                        onClick={() => handleCcUser(user)}
                      >
                        <div className={styles.searchResultName}>{user.name || "Unknown"}</div>
                        <div className={styles.searchResultEmail}>{user.detail}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Custom Context Menu */}
      {contextMenu && (
        <div 
          className={styles.contextMenu}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <div 
            className={styles.contextMenuItem}
            onClick={() => handleOpenSpecificNewTab(contextMenu.ticketId)}
          >
            <span>💬</span> Open in New Tab
          </div>
          <div 
            className={styles.contextMenuItem}
            onClick={() => handleOpenNewBrowserWindow(contextMenu.ticketId)}
          >
            <span>🌐</span> Open in new browser tab
          </div>
          <div 
            className={styles.contextMenuItem}
            onClick={() => alert("Marked as critical priority!")}
          >
            <span>🚨</span> Escalate Priority
          </div>
        </div>
      )}

      {/* Expand Icon Bottom Right */}
      {!urlTicketId && (
        <div className={styles.expandBtn} onClick={() => setShowExpandModal(true)}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 14v6h6M20 10V4h-6M14 10l6-6M10 14l-6 6" />
          </svg>
        </div>
      )}

      {/* Custom Modal for Expand View */}
      {showExpandModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: '80%', height: '80%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 className={styles.modalTitle}>Expanded Ticket View</h3>
              <button className={styles.btnCancel} onClick={() => setShowExpandModal(false)}>Close</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div className={styles.messageContent} style={{ whiteSpace: 'pre-wrap' }}>
                {activeTicket?.snippet || "No ticket selected"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toastContainer}>
          {showToast}
        </div>
      )}
      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New Ticket</h3>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {!isUser && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select User</label>
                  {!selectedUser ? (
                    <>
                      <input 
                        type="text" 
                        className={styles.input} 
                        placeholder="Search by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {isSearching && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Searching...</div>}
                      {searchResults.length > 0 && (
                        <div className={styles.searchResultContainer}>
                          {searchResults.map(user => (
                            <div 
                              key={user.id} 
                              className={styles.searchResultItem}
                              onClick={() => { setSelectedUser(user); setSearchQuery(""); }}
                            >
                              <div className={styles.searchResultName}>{user.name || "Unknown"}</div>
                              <div className={styles.searchResultEmail}>{user.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedUser.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedUser.email}</div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Ticket Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="E.g. Unable to access billing" 
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Describe the issue on behalf of the user..." 
                  value={newTicketForm.snippet}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, snippet: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Entity Type (Optional)</label>
                  <div className={styles.customDropdownContainer}>
                    <button 
                      className={styles.customDropdownTrigger}
                      onClick={(e) => { e.stopPropagation(); setShowEntityMenu(!showEntityMenu); setShowCategoryMenu(false); setShowPriorityMenu(false); }}
                      style={{ padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
                    >
                      {newTicketForm.entityType}
                      <span className={styles.dropdownArrow}>▼</span>
                    </button>
                    {showEntityMenu && (
                      <div className={styles.customDropdownMenu}>
                        {["Post", "User", "Comment", "Collection"].map(type => (
                          <div 
                            key={type}
                            className={styles.customDropdownItem} 
                            onClick={(e) => { e.stopPropagation(); setNewTicketForm({...newTicketForm, entityType: type}); setSelectedEntity(null); setEntityQuery(""); setShowEntityMenu(false); }}
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Search Entity (Optional)</label>
                  {!selectedEntity ? (
                    <>
                      <input 
                        type="text" 
                        className={styles.input} 
                        placeholder={`Search ${newTicketForm.entityType}...`} 
                        value={entityQuery}
                        onChange={(e) => setEntityQuery(e.target.value)}
                      />
                      {isSearchingEntity && <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Searching...</div>}
                      {entityResults.length > 0 && (
                        <div className={styles.searchResultContainer}>
                          {entityResults.map(entity => (
                            <div 
                              key={entity.id} 
                              className={styles.searchResultItem}
                              onClick={() => { setSelectedEntity(entity); setEntityQuery(""); }}
                            >
                              <div className={styles.searchResultName}>{entity.name}</div>
                              <div className={styles.searchResultEmail}>{entity.detail}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedEntity.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedEntity.detail}</div>
                      </div>
                      <button onClick={() => setSelectedEntity(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.customDropdownContainer}>
                    <button 
                      className={styles.customDropdownTrigger}
                      onClick={(e) => { e.stopPropagation(); setShowCategoryMenu(!showCategoryMenu); setShowPriorityMenu(false); }}
                      style={{ padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
                    >
                      {newTicketForm.category}
                      <span className={styles.dropdownArrow}>▼</span>
                    </button>
                    {showCategoryMenu && (
                      <div className={styles.customDropdownMenu}>
                        {["General", "Bug Report", "Feature Request", "Billing"].map(cat => (
                          <div 
                            key={cat}
                            className={styles.customDropdownItem} 
                            onClick={(e) => { e.stopPropagation(); setNewTicketForm({...newTicketForm, category: cat}); setShowCategoryMenu(false); }}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Priority</label>
                  <div className={styles.customDropdownContainer}>
                    <button 
                      className={styles.customDropdownTrigger}
                      onClick={(e) => { e.stopPropagation(); setShowPriorityMenu(!showPriorityMenu); setShowCategoryMenu(false); }}
                      style={{ padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
                    >
                      {newTicketForm.priority}
                      <span className={styles.dropdownArrow}>▼</span>
                    </button>
                    {showPriorityMenu && (
                      <div className={styles.customDropdownMenu}>
                        {["Low", "Medium", "High", "Urgent"].map(pri => (
                          <div 
                            key={pri}
                            className={styles.customDropdownItem} 
                            onClick={(e) => { e.stopPropagation(); setNewTicketForm({...newTicketForm, priority: pri}); setShowPriorityMenu(false); }}
                          >
                            {pri}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                className={styles.submitBtn} 
                onClick={handleCreateTicket}
                disabled={!selectedUser || !newTicketForm.title.trim() || !newTicketForm.snippet.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
