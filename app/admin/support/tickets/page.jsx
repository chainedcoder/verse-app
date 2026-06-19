"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Tickets.module.css";

const TICKETS_DATA = [
  {
    id: "128",
    status: "New",
    time: "13:34",
    title: "Reinstate Flagged Poem",
    snippet: "My poem 'Echoes of Midnight' was incorrectly flagged for moderation...",
    pinned: true,
    unread: 2,
    read: false,
    reporter: {
      name: "Jane Doe",
      initials: "JD",
      email: "janedoe@mail.com",
      phone: "+62 899 877 8666"
    },
    date: "Sept 20, 2024",
    rawDate: "2024-11-12T13:34:00Z",
    requestType: "Moderation",
    entityDetail: {
      type: "Poem / Verse",
      id: "#P183294",
      name: "Echoes of Midnight",
      extraLabel: "Engagement",
      extraValue: "142 likes, 12 comments",
      statusLabel: "Safety Flag",
      statusValue: "Automated (Spam flag)"
    },
    messages: [
      {
        id: "m128-1",
        sender: "user",
        senderName: "Jane Doe",
        avatar: "JD",
        time: "13:34",
        bubbles: [
          "My poem 'Echoes of Midnight' was incorrectly flagged for moderation. It is completely original and does not violate any safety guidelines. Could you please review and reinstate it?",
          "The Poem ID is #P183294. Look forward to your help."
        ]
      }
    ],
    timestamp: "Tuesday, November 12th 2024 13:34"
  },
  {
    id: "129",
    status: "Open",
    time: "13:34",
    title: "Featured Poem Banner Request",
    snippet: "I received an email saying my poem was selected for the Featured section...",
    pinned: true,
    unread: 0,
    read: true,
    reporter: {
      name: "John Smith",
      initials: "JS",
      email: "john@mail.com",
      phone: "+62 899 111 2222"
    },
    date: "Sept 21, 2024",
    rawDate: "2024-11-13T10:00:00Z",
    requestType: "Promotion",
    entityDetail: {
      type: "Promotion Slot",
      id: "#AD9921",
      name: "Homepage Featured Hero",
      extraLabel: "Views Target",
      extraValue: "50,000 views",
      statusLabel: "Status",
      statusValue: "Pending Activation"
    },
    messages: [
      {
        id: "m129-1",
        sender: "user",
        senderName: "John Smith",
        avatar: "JS",
        time: "10:00",
        bubbles: [
          "Can someone help me activate the featured banner for my poem? I received a selection notice yesterday, but my stats are showing it is still in draft featured mode."
        ]
      }
    ],
    timestamp: "Wednesday, November 13th 2024 10:00"
  },
  {
    id: "130",
    status: "Open",
    time: "13:34",
    title: "Inappropriate Comments",
    snippet: "Dear Support Team, some users are leaving spam/harassing comments...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Alice Doe",
      initials: "AD",
      email: "alice@mail.com",
      phone: "+62 899 333 4444"
    },
    date: "Sept 22, 2024",
    rawDate: "2024-11-14T11:20:00Z",
    requestType: "Safety",
    entityDetail: {
      type: "Comment Thread",
      id: "#C772183",
      name: "Sunset over Prose (Poem)",
      extraLabel: "Comment Count",
      extraValue: "88 comments",
      statusLabel: "Moderate Action",
      statusValue: "Reported: Harassment"
    },
    messages: [
      {
        id: "m130-1",
        sender: "user",
        senderName: "Alice Doe",
        avatar: "AD",
        time: "11:20",
        bubbles: [
          "Some anonymous users have been leaving inappropriate comments on my poem. Please help clean them up or lock the comment thread."
        ]
      }
    ],
    timestamp: "Thursday, November 14th 2024 11:20"
  },
  {
    id: "131",
    status: "Pending",
    time: "13:34",
    title: "Change Pen Name",
    snippet: "Hi! I would like to change my display pen name from 'Bard99' to 'GoldenScribe'...",
    pinned: false,
    unread: 1,
    read: false,
    reporter: {
      name: "Bob Doe",
      initials: "BD",
      email: "bob@mail.com",
      phone: "+62 899 555 6666"
    },
    date: "Sept 23, 2024",
    rawDate: "2024-11-15T14:15:00Z",
    requestType: "Account",
    entityDetail: {
      type: "User Account",
      id: "#U99120",
      name: "Bard99 (Handle: @bard)",
      extraLabel: "Account Status",
      extraValue: "Verified Member",
      statusLabel: "Action Required",
      statusValue: "Rename displays"
    },
    messages: [
      {
        id: "m131-1",
        sender: "user",
        senderName: "Bob Doe",
        avatar: "BD",
        time: "14:15",
        bubbles: [
          "Hi! I would like to change my display pen name from 'Bard99' to 'GoldenScribe' but keep my original handle @bard."
        ]
      }
    ]
  },
  {
    id: "132",
    status: "Open",
    time: "13:34",
    title: "OAuth Login Error",
    snippet: "I am unable to login using my Google account. It keeps redirecting me...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Charlie Doe",
      initials: "CD",
      email: "charlie@mail.com",
      phone: "+62 899 777 8888"
    },
    date: "Sept 24, 2024",
    rawDate: "2024-11-16T09:40:00Z",
    requestType: "Auth Bug",
    entityDetail: null,
    messages: [
      {
        id: "m132-1",
        sender: "user",
        senderName: "Charlie Doe",
        avatar: "CD",
        time: "09:40",
        bubbles: [
          "I am unable to login using my Google account. It keeps redirecting me to the signup page even though I have an active profile."
        ]
      }
    ]
  },
  {
    id: "133",
    status: "Pending",
    time: "13:34",
    title: "Sponsorship Payout Details",
    snippet: "Hi, I have accumulated over $150 in tips and sponsorship rewards on my profile...",
    pinned: false,
    unread: 3,
    read: false,
    reporter: {
      name: "David Doe",
      initials: "DD",
      email: "david@mail.com",
      phone: "+62 899 999 0000"
    },
    date: "Sept 25, 2024",
    rawDate: "2024-11-17T16:15:00Z",
    requestType: "Billing",
    entityDetail: {
      type: "Stripe Invoice",
      id: "#INVC-883921",
      name: "Author Tips Wallet payout",
      extraLabel: "Accrued Amount",
      extraValue: "$150.00 USD",
      statusLabel: "Payout Status",
      statusValue: "Stalled"
    },
    messages: [
      {
        id: "m133-1",
        sender: "user",
        senderName: "David Doe",
        avatar: "DD",
        time: "16:15",
        bubbles: [
          "Hi, I have accumulated over $150 in tips and sponsorship rewards on my profile, but the payout is stalled in pending state. Can you check my Stripe integration status?"
        ]
      }
    ]
  },
  {
    id: "134",
    status: "Closed",
    time: "13:34",
    title: "Copyright Plagiarism Report",
    snippet: "Someone copied my poem 'Starlight' word-for-word and posted it under their profile...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Frank Miller",
      initials: "FM",
      email: "frank@mail.com",
      phone: "+62 899 222 3333"
    },
    date: "Sept 10, 2024",
    rawDate: "2024-11-10T11:00:00Z",
    requestType: "Safety",
    entityDetail: {
      type: "Poem Post",
      id: "#P992182",
      name: "Starlight (Plagiarized Post)",
      extraLabel: "Reporter Profile",
      extraValue: "Frank Miller",
      statusLabel: "Resolution Status",
      statusValue: "Post removed, warning issued"
    },
    messages: [
      {
        id: "m134-1",
        sender: "user",
        senderName: "Frank Miller",
        avatar: "FM",
        time: "11:00",
        bubbles: [
          "Someone copied my poem 'Starlight' word-for-word and posted it under their profile. I have the original timestamp and drafts to prove plagiarism."
        ]
      }
    ]
  },
  {
    id: "135",
    status: "Closed",
    time: "13:34",
    title: "Tip Wallet Settlement Issues",
    snippet: "I requested a payout of my tips last Monday but still haven't received it...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Grace Hopper",
      initials: "GH",
      email: "grace@mail.com",
      phone: "+62 899 444 5555"
    },
    date: "Sept 09, 2024",
    rawDate: "2024-11-09T15:30:00Z",
    requestType: "Billing",
    entityDetail: {
      type: "Payout Settlement",
      id: "#PAY-90123",
      name: "Wallet Payout",
      extraLabel: "Payout Amount",
      extraValue: "$85.00 USD",
      statusLabel: "Settled Status",
      statusValue: "Paid successfully"
    },
    messages: [
      {
        id: "m135-1",
        sender: "user",
        senderName: "Grace Hopper",
        avatar: "GH",
        time: "15:30",
        bubbles: [
          "I requested a payout of my tips last Monday but still haven't received it. Is there an issue with my registered bank details?"
        ]
      }
    ]
  },
  {
    id: "136",
    status: "Closed",
    time: "13:34",
    title: "Change Registered Email",
    snippet: "Could you please update my registered email to grace@hopper.org...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Henry Lovelace",
      initials: "HL",
      email: "henry@mail.com",
      phone: "+62 899 666 7777"
    },
    date: "Sept 08, 2024",
    rawDate: "2024-11-08T12:00:00Z",
    requestType: "Account",
    entityDetail: null,
    messages: [
      {
        id: "m136-1",
        sender: "user",
        senderName: "Henry Lovelace",
        avatar: "HL",
        time: "12:00",
        bubbles: [
          "Could you please update my registered email to grace@hopper.org? I am losing access to my old email provider next week."
        ]
      }
    ]
  },
  {
    id: "137",
    status: "Closed",
    time: "13:34",
    title: "Double Subscription Charge",
    snippet: "My bank account shows two debits of $4.99 for Verse Premium...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Ivy Watson",
      initials: "IW",
      email: "ivy@mail.com",
      phone: "+62 899 888 9999"
    },
    date: "Sept 07, 2024",
    rawDate: "2024-11-07T08:45:00Z",
    requestType: "Billing",
    entityDetail: {
      type: "Stripe Charge",
      id: "#CH-9912093",
      name: "Premium Subscription Duo",
      extraLabel: "Amount Charged",
      extraValue: "$9.98 USD",
      statusLabel: "Refund Action",
      statusValue: "Refunded $4.99"
    },
    messages: [
      {
        id: "m137-1",
        sender: "user",
        senderName: "Ivy Watson",
        avatar: "IW",
        time: "08:45",
        bubbles: [
          "My bank account shows two debits of $4.99 for Verse Premium this month. Please refund the duplicate transaction."
        ]
      }
    ]
  },
  {
    id: "138",
    status: "Closed",
    time: "13:34",
    title: "Banned Account Appeals",
    snippet: "My pen name 'AnarchistPoet' was flagged and banned. I appeal this choice...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Jack Black",
      initials: "JB",
      email: "jack@mail.com",
      phone: "+62 899 111 0000"
    },
    date: "Sept 06, 2024",
    rawDate: "2024-11-06T14:20:00Z",
    requestType: "Safety",
    entityDetail: null,
    messages: [
      {
        id: "m138-1",
        sender: "user",
        senderName: "Jack Black",
        avatar: "JB",
        time: "14:20",
        bubbles: [
          "My pen name 'AnarchistPoet' was flagged and banned for violating community codes. I appeal this choice since the content was satirical and met all creative guidelines."
        ]
      }
    ]
  },
  {
    id: "139",
    status: "Closed",
    time: "13:34",
    title: "Incorrect Formatting on Export",
    snippet: "When I click 'Export PDF' on my poetry book, the page breaks are completely...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Kate Spade",
      initials: "KS",
      email: "kate@mail.com",
      phone: "+62 899 222 1111"
    },
    date: "Sept 05, 2024",
    rawDate: "2024-11-05T10:30:00Z",
    requestType: "General",
    entityDetail: null,
    messages: [
      {
        id: "m139-1",
        sender: "user",
        senderName: "Kate Spade",
        avatar: "KS",
        time: "10:30",
        bubbles: [
          "When I click 'Export PDF' on my poetry book, the page breaks are completely scattered and ruins the print rhythm."
        ]
      }
    ]
  },
  {
    id: "140",
    status: "Open",
    time: "13:34",
    title: "Draft Collections Vanished",
    snippet: "All three of my collection drafts are missing from my write panel...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Leo Messi",
      initials: "LM",
      email: "leo@mail.com",
      phone: "+62 899 555 4444"
    },
    date: "Sept 26, 2024",
    rawDate: "2024-11-18T18:00:00Z",
    requestType: "General",
    entityDetail: null,
    messages: [
      {
        id: "m140-1",
        sender: "user",
        senderName: "Leo Messi",
        avatar: "LM",
        time: "18:00",
        bubbles: [
          "All three of my collection drafts are missing from my write panel. I didn't click delete, they just vanished after the server update."
        ]
      }
    ]
  },
  {
    id: "141",
    status: "Pending",
    time: "13:34",
    title: "Report Copyright Plagiarism 2",
    snippet: "Another user has uploaded my entire poem series without permission...",
    pinned: false,
    unread: 0,
    read: true,
    reporter: {
      name: "Manny Pacquiao",
      initials: "MP",
      email: "manny@mail.com",
      phone: "+62 899 666 5555"
    },
    date: "Sept 27, 2024",
    rawDate: "2024-11-19T09:00:00Z",
    requestType: "Safety",
    entityDetail: null,
    messages: [
      {
        id: "m141-1",
        sender: "user",
        senderName: "Manny Pacquiao",
        avatar: "MP",
        time: "09:00",
        bubbles: [
          "Another user has uploaded my entire poem series without my permission. Please review and remove them ASAP."
        ]
      }
    ]
  },
  {
    id: "142",
    status: "New",
    time: "13:34",
    title: "Unable to Add Cover Art",
    snippet: "Every time I attempt to upload cover art to my collection, it shows generic...",
    pinned: false,
    unread: 1,
    read: false,
    reporter: {
      name: "Neil Armstrong",
      initials: "NA",
      email: "neil@mail.com",
      phone: "+62 899 777 6666"
    },
    date: "Sept 28, 2024",
    rawDate: "2024-11-20T12:00:00Z",
    requestType: "General",
    entityDetail: null,
    messages: [
      {
        id: "m142-1",
        sender: "user",
        senderName: "Neil Armstrong",
        avatar: "NA",
        time: "12:00",
        bubbles: [
          "Every time I attempt to upload cover art to my collection, it shows generic file upload errors on S3 pipeline."
        ]
      }
    ]
  },
  {
    id: "143",
    status: "New",
    time: "13:34",
    title: "Request for Custom Verification Badges",
    snippet: "I have accumulated over 10k followers. How do I get verified display badge...",
    pinned: false,
    unread: 2,
    read: false,
    reporter: {
      name: "Oscar Wilde",
      initials: "OW",
      email: "oscar@mail.com",
      phone: "+62 899 999 8888"
    },
    date: "Sept 29, 2024",
    rawDate: "2024-11-21T15:30:00Z",
    requestType: "Account",
    entityDetail: null,
    messages: [
      {
        id: "m143-1",
        sender: "user",
        senderName: "Oscar Wilde",
        avatar: "OW",
        time: "15:30",
        bubbles: [
          "I have accumulated over 10k followers on my poetry channel. How do I request a verified account display badge?"
        ]
      }
    ]
  }
];

const getTagClass = (status) => {
  if (status === "New") return styles.tagNew;
  if (status === "Open") return styles.tagOpen;
  if (status === "Pending") return styles.tagPending;
  return styles.tagClosed;
};

export default function TicketsPage() {
  const [activeTickets, setActiveTickets] = useState(TICKETS_DATA);
  const [activeTabs, setActiveTabs] = useState([TICKETS_DATA[0], TICKETS_DATA[2], TICKETS_DATA[1], TICKETS_DATA[15], TICKETS_DATA[14]]);
  const [activeTabId, setActiveTabId] = useState(TICKETS_DATA[0].id);

  const [mobileView, setMobileView] = useState("list"); // "list", "chat", "info"
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
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

  // Restore active tabs and ID from sessionStorage (survives navigations, cleared on window/browser close)
  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return; // Do not clear defaults in test environments

    if (typeof window !== "undefined") {
      try {
        const storedTabId = sessionStorage.getItem("support_active_tab_id");
        const storedTabsRaw = sessionStorage.getItem("support_active_tabs");
        const storedMobileView = sessionStorage.getItem("support_mobile_view");
        
        if (storedTabsRaw) {
          const parsedIds = JSON.parse(storedTabsRaw);
          const restoredTabs = TICKETS_DATA.filter(t => parsedIds.includes(t.id));
          setActiveTabs(restoredTabs);
        } else {
          setActiveTabs([]);
        }
        
        if (storedTabId) {
          const hasMatch = TICKETS_DATA.some(t => t.id === storedTabId);
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
      } catch (e) {
        console.error("Error restoring session state:", e);
      }
    }
  }, []);

  // Persist session-level tab state
  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

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
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

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
    const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    if (isTestEnv) return;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("support_mobile_view", mobileView);
      } catch (e) {
        console.error(e);
      }
    }
  }, [mobileView]);
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

  // Settings & Toggling
  const [contextMenu, setContextMenu] = useState(null); // { x: 0, y: 0, ticketId: "" }
  const [urlTicketId, setUrlTicketId] = useState(null);

  // Pagination / Limit State
  const [recentLimit, setRecentLimit] = useState(3);
  const [unresolvedLimit, setUnresolvedLimit] = useState(5);
  const [resolvedLimit, setResolvedLimit] = useState(5);

  // Resize state
  const [rightPaneWidth, setRightPaneWidth] = useState(320);
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false);
  const [preCollapseWidth, setPreCollapseWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

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
    };
    window.addEventListener("click", closeContext);
    return () => window.removeEventListener("click", closeContext);
  }, []);

  const activeTicket = activeTabs.find(t => t.id === activeTabId);

  const handleSend = () => {
    if (!replyText.trim() || !activeTicket) return;

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
    
    // Sync active tabs state
    const currentUpdatedTicket = updatedTickets.find(t => t.id === activeTicket.id);
    setActiveTabs(prev => prev.map(t => t.id === activeTicket.id ? currentUpdatedTicket : t));

    setShowToast("Message sent successfully!");
    setReplyText("");
    setTimeout(() => setShowToast(""), 3000);
  };

  // 1. Filter Logic (Search text + Open/Closed filter)
  const filteredTickets = activeTickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.snippet.toLowerCase().includes(search.toLowerCase()) || 
                          t.reporter.name.toLowerCase().includes(search.toLowerCase());
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
    // CATEGORIZED DATE VIEW (Default Sections with Zero-Duplication across sections)
    const pinnedTickets = filteredTickets.filter(t => t.pinned).sort(comparator);
    const nonPinned = filteredTickets.filter(t => !t.pinned).sort(comparator);
    
    // Recent Section shows up to recentLimit conversations (excluding pinned)
    const recentTickets = nonPinned.slice(0, recentLimit);
    
    // Unresolved Section shows remaining unresolved conversations older than recent limit
    const unresolvedTickets = nonPinned
      .filter(t => t.status !== "Closed")
      .filter(t => !recentTickets.some(r => r.id === t.id));
      
    // Resolved Section shows remaining resolved conversations older than recent limit
    const resolvedTickets = nonPinned
      .filter(t => t.status === "Closed")
      .filter(t => !recentTickets.some(r => r.id === t.id));

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
            <h1 className={styles.title}>Tickets</h1>
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
            {listContentToRender}
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
                              {text}
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
                  <span className={styles.replyCc}>CC</span>
                </div>
                <textarea 
                  className={styles.textarea}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
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
                  <h2 className={styles.metaTitle}>Ticket #{activeTicket.id}</h2>
                  {!isMobile && (
                    <button 
                      className={styles.tabletCloseDrawerBtn}
                      onClick={() => setIsRightPaneCollapsed(true)}
                      title="Collapse details panel"
                    >
                      ✕
                    </button>
                  )}
                  <span className={`${styles.tag} ${getTagClass(activeTicket.status)}`}>{activeTicket.status}</span>
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
                  <div className={styles.metaBox}>
                    <div className={styles.metaAvatar} style={{ background: '#f0f0f0' }}>AL</div>
                    <span>Aspen Lipshutz (Me)</span>
                  </div>
                </div>
                <div>
                  <span className={styles.metaLabel} style={{ fontSize: '13px' }}>Line Manager</span>
                  <div className={styles.metaBox}>
                    <div className={styles.metaAvatar} style={{ background: '#f0f0f0' }}>MR</div>
                    <span>Martin Rogers</span>
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
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>MR</div>
                    <div>
                      <div className={styles.timelineContent}>Ticket assigned to <span style={{color:'#2563eb'}}>Aspen Lipshutz (Me)</span> by Martin Rogers</div>
                      <div className={styles.timelineTime}>November 12th 2024 13:34</div>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>{activeTicket.reporter?.initials || "JD"}</div>
                    <div>
                      <div className={styles.timelineContent}>Ticket has been created by <span style={{color:'#2563eb'}}>{activeTicket.reporter?.name || "Jane Doe"}</span></div>
                      <div className={styles.timelineTime}>November 12th 2024 13:34</div>
                    </div>
                  </div>
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
                {activeTicket?.messages[0]?.bubbles.join("\n") || activeTicket?.snippet || "No ticket selected"}
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
    </div>
  );
}
