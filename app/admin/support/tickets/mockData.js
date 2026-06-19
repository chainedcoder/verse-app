export const TICKETS_DATA = [
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

