// ============================================
// VERSE — Data Store
// Sample poems, authors, tags + state management
// ============================================

export const authors = [
  {
    id: 'emily-dickins',
    name: 'Emily Dickins',
    initials: 'ED',
    bio: 'travel blogger, aspiring poet',
    location: 'London',
    avatarClass: 'avatar-warm',
    poems: 38,
    readers: 132,
    reading: 43,
  },
  {
    id: 'robert-burns',
    name: 'Robert Burns',
    initials: 'RB',
    bio: 'classic poet',
    location: 'Edinburgh',
    avatarClass: 'avatar-purple',
    poems: 24,
    readers: 289,
    reading: 15,
  },
  {
    id: 'anna-adams',
    name: 'Anna Adams',
    initials: 'AA',
    bio: 'journalist',
    location: 'New York',
    avatarClass: 'avatar-green',
    poems: 12,
    readers: 78,
    reading: 62,
  },
  {
    id: 'maya-lin',
    name: 'Maya Lin',
    initials: 'ML',
    bio: 'spoken word artist',
    location: 'San Francisco',
    avatarClass: 'avatar-blue',
    poems: 19,
    readers: 156,
    reading: 31,
  },
  {
    id: 'james-wright',
    name: 'James Wright',
    initials: 'JW',
    bio: 'nature poet, teacher',
    location: 'Vermont',
    avatarClass: 'avatar-amber',
    poems: 45,
    readers: 201,
    reading: 28,
  },
  {
    id: 'sofia-reyes',
    name: 'Sofia Reyes',
    initials: 'SR',
    bio: 'lyricist, songwriter',
    location: 'Barcelona',
    avatarClass: 'avatar-rose',
    poems: 31,
    readers: 167,
    reading: 44,
  },
];

export const poems = [
  {
    id: 'hope-is-the-thing',
    title: 'Hope is the thing with feathers',
    authorId: 'emily-dickins',
    tags: ['romantic', 'reflective'],
    featured: true,
    excerpt: `"Hope" is the thing with feathers —\nThat perches in the soul —\nAnd sings the tune without the words —\nAnd never stops — at all —`,
    fullText: `"Hope" is the thing with feathers —\nThat perches in the soul —\nAnd sings the tune without the words —\nAnd never stops — at all —\n\nAnd sweetest — in the Gale — is heard —\nAnd sore must be the storm —\nThat could abash the little Bird\nThat kept so many warm —\n\nI've heard it in the chillest land —\nAnd on the strangest Sea —\nYet — never — in Extremity,\nIt asked a crumb — of me.`,
    likes: 248,
    date: '2 days ago',
  },
  {
    id: 'a-red-red-rose',
    title: 'A Red, Red Rose',
    authorId: 'robert-burns',
    tags: ['romantic', 'lyrics'],
    featured: false,
    excerpt: `O my Luve is like a red, red rose / That's newly sprung in June…`,
    fullText: `O my Luve is like a red, red rose\nThat's newly sprung in June;\nO my Luve is like the melody\nThat's sweetly played in tune.\n\nSo fair art thou, my bonnie lass,\nSo deep in luve am I;\nAnd I will luve thee still, my dear,\nTill a' the seas gang dry.\n\nTill a' the seas gang dry, my dear,\nAnd the rocks melt wi' the sun;\nI will love thee still, my dear,\nWhile the sands o' life shall run.\n\nAnd fare thee weel, my only luve!\nAnd fare thee weel awhile!\nAnd I will come again, my luve,\nThough it were ten thousand mile.`,
    likes: 187,
    date: '2 days ago',
  },
  {
    id: 'wildflowers',
    title: 'Wildflowers',
    authorId: 'emily-dickins',
    tags: ['romantic', 'reflective'],
    featured: false,
    excerpt: `My wildflowers in your closet / Your departure in my…`,
    fullText: `My wildflowers in your closet,\nYour departure in my bones.\nWe traded silence like a currency\nNeither of us could afford.\n\nI left petals on your doorstep,\nYou left footprints in my chest.\nEvery bloom a small confession\nThat I never could express.\n\nThe garden knows what I can't say —\nThat roots run deeper than goodbye,\nThat love, like wildflowers, finds a way\nTo break through any sky.`,
    likes: 91,
    date: '5 days ago',
  },
  {
    id: 'first-frost',
    title: 'First frost',
    authorId: 'emily-dickins',
    tags: ['haiku', 'reflective'],
    featured: false,
    excerpt: `Stillness on the glass / A breath held between two worlds…`,
    fullText: `Stillness on the glass,\nA breath held between two worlds —\nWinter writes in white.`,
    likes: 57,
    date: '1 week ago',
  },
  {
    id: 'city-rain',
    title: 'City Rain',
    authorId: 'anna-adams',
    tags: ['reflective', 'spoken word'],
    featured: false,
    excerpt: `The city sighs in silver threads / weaving stories through the streets…`,
    fullText: `The city sighs in silver threads,\nWeaving stories through the streets.\nEach raindrop holds a memory\nOf lovers, strangers, passing beats.\n\nThe neon bleeds into the puddles,\nA kaleidoscope of light.\nWe run between the moments,\nChasing warmth into the night.\n\nListen — can you hear it?\nBeneath the traffic's hum,\nThe rain is speaking poems\nThat the morning sun will shun.`,
    likes: 134,
    date: '3 days ago',
  },
  {
    id: 'ocean-floor',
    title: 'The Ocean Floor',
    authorId: 'maya-lin',
    tags: ['reflective', 'spoken word'],
    featured: false,
    excerpt: `There's a language at the bottom / where light gives up its name…`,
    fullText: `There's a language at the bottom\nWhere light gives up its name,\nWhere pressure turns to poetry\nAnd silence sounds the same.\n\nI dove past every expectation,\nPast the coral and the doubt.\nFound my voice in the abyss\nWhere the world had filtered out.\n\nThey say the deep is darkness.\nI say the deep is peace.\nA place where all the noise of living\nFinally finds release.`,
    likes: 203,
    date: '4 days ago',
  },
  {
    id: 'morning-light',
    title: 'Morning Light',
    authorId: 'james-wright',
    tags: ['reflective', 'haiku'],
    featured: false,
    excerpt: `Golden threads across / the meadow's sleepy canvas / dawn begins to sing…`,
    fullText: `Golden threads across\nThe meadow's sleepy canvas —\nDawn begins to sing.`,
    likes: 89,
    date: '6 days ago',
  },
  {
    id: 'unwritten-song',
    title: 'Unwritten Song',
    authorId: 'sofia-reyes',
    tags: ['lyrics', 'romantic'],
    featured: false,
    excerpt: `You are the melody I've been humming / in the space between my breaths…`,
    fullText: `You are the melody I've been humming\nIn the space between my breaths,\nThe chorus I keep coming back to\nWhen the world drowns out the rest.\n\nI'll write you into every verse,\nBetween the lines of what I feel.\nA song that stays unfinished\nSo the feeling stays this real.\n\nHum it with me, won't you?\nLet the notes fall where they may.\nSome songs aren't meant for endings —\nThey're meant to make you stay.`,
    likes: 176,
    date: '1 day ago',
  },
];

export const allTags = ['romantic', 'reflective', 'lyrics', 'haiku', 'spoken word'];

export const trendingAuthors = ['anna-adams', 'emily-dickins', 'robert-burns'];

// ============================================
// State Management
// ============================================

const STATE_KEY = 'verse_state';

function loadState() {
  try {
    const saved = sessionStorage.getItem(STATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return { likedPoems: [], followedAuthors: ['emily-dickins'] };
}

function saveState() {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

export const state = loadState();

export function toggleLike(poemId) {
  const idx = state.likedPoems.indexOf(poemId);
  if (idx === -1) {
    state.likedPoems.push(poemId);
  } else {
    state.likedPoems.splice(idx, 1);
  }
  saveState();
  return idx === -1; // true if now liked
}

export function isLiked(poemId) {
  return state.likedPoems.includes(poemId);
}

export function toggleFollow(authorId) {
  const idx = state.followedAuthors.indexOf(authorId);
  if (idx === -1) {
    state.followedAuthors.push(authorId);
  } else {
    state.followedAuthors.splice(idx, 1);
  }
  saveState();
  return idx === -1; // true if now following
}

export function isFollowing(authorId) {
  return state.followedAuthors.includes(authorId);
}

export function getAuthor(authorId) {
  return authors.find(a => a.id === authorId);
}

export function getPoem(poemId) {
  return poems.find(p => p.id === poemId);
}

export function getPoemsByAuthor(authorId) {
  return poems.filter(p => p.authorId === authorId);
}

export function getPoemsByTag(tag) {
  if (!tag || tag === 'all') return poems;
  return poems.filter(p => p.tags.includes(tag));
}

export function getLikeCount(poemId) {
  const poem = getPoem(poemId);
  if (!poem) return 0;
  const baseLikes = poem.likes;
  const userLiked = isLiked(poemId);
  return userLiked ? baseLikes + 1 : baseLikes;
}
