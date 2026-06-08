import { getBooks } from '../api/booksApi.js';

const VALID_GENRES = ['Literatura', 'Ação', 'Ficção', 'Comédia', 'Terror'];
const VALID_FORMATS = ['Capa Dura', 'Brochura', 'Digital'];
const VALID_LANGUAGES = ['Português (Brasil)', 'Inglês', 'Francês', 'Espanhol'];

const GENRE_KEYWORDS = {
  'Literatura': ['literature', 'literary', 'literatura', 'classic', 'novel', 'poetry', 'drama', 'philosophy'],
  'Ação': ['action', 'adventure', 'thriller', 'war', 'spy', 'military', 'survival'],
  'Ficção': ['fiction', 'fantasy', 'science fiction', 'sci-fi', 'dystopia', 'utopia', 'speculative'],
  'Comédia': ['comedy', 'humor', 'humour', 'satire', 'parody', 'funny', 'comic'],
  'Terror': ['horror', 'terror', 'gothic', 'supernatural', 'ghost', 'dark', 'scary', 'mystery', 'crime']
};

const LANGUAGE_MAP = {
  'por': 'Português (Brasil)',
  'eng': 'Inglês',
  'fre': 'Francês',
  'fra': 'Francês',
  'spa': 'Espanhol'
};

const COVERS = ['cover-theme-1', 'cover-theme-2', 'cover-theme-3', 'cover-theme-4', 'cover-theme-5', 'cover-theme-6'];
const EMBLEMS = ['🌿', '🔍', '✦', '🏛️', '🍯', '🐚'];
const PRICES = [8.99, 12.99, 14.99, 16.50, 18.99, 22.00, 25.50, 9.99, 19.99, 27.50];

function detectGenre(subjects) {
  if (!subjects || subjects.length === 0) return null;

  const joined = subjects.slice(0, 10).join(' ').toLowerCase();

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (joined.includes(keyword)) return genre;
    }
  }

  return null;
}

function detectLanguage(languages) {
  if (!languages || languages.length === 0) return null;

  for (const code of languages) {
    const mapped = LANGUAGE_MAP[code];
    if (mapped) return mapped;
  }

  return null;
}

function normalizeBook(rawBook, index) {
  const genre = detectGenre(rawBook.subject);
  if (!genre) return null;

  const language = detectLanguage(rawBook.language);
  if (!language) return null;

  return {
    id: rawBook.key?.replace('/works/', '') || `book-${index}`,
    title: rawBook.title || 'Sem título',
    author: rawBook.author_name?.[0] || 'Autor desconhecido',
    genre,
    format: VALID_FORMATS[index % VALID_FORMATS.length],
    language,
    price: PRICES[index % PRICES.length],
    rating: rawBook.ratings_average ? parseFloat(rawBook.ratings_average.toFixed(1)) : 0,
    ratingsCount: rawBook.ratings_count || 0,
    coverTheme: COVERS[index % COVERS.length],
    emblem: EMBLEMS[index % EMBLEMS.length],
    year: rawBook.first_publish_year || '',
  };
}

function cacheBooks(books) {
  try {
    const db = JSON.parse(localStorage.getItem('bookverse_db') || '{}');
    books.forEach(b => {
      if (b) db[b.id] = b;
    });
    localStorage.setItem('bookverse_db', JSON.stringify(db));
  } catch (e) {
    console.warn('Erro ao salvar no cache local', e);
  }
}

function getBookFromDb(id) {
  try {
    const db = JSON.parse(localStorage.getItem('bookverse_db') || '{}');
    return db[id] || null;
  } catch {
    return null;
  }
}

async function getFeaturedBooks() {
  const data = await getBooks('literatura classica vintage');
  const books = data.docs.slice(0, 8).map(normalizeBook).filter(Boolean);
  cacheBooks(books);
  return books;
}

async function searchBooks(query) {
  const data = await getBooks(query);
  const books = data.docs.map(normalizeBook).filter(Boolean);
  cacheBooks(books);
  return books;
}

function sortBooks(books, criteria) {
  const sorted = [...books];
  if (criteria === 'price-asc') return sorted.sort((a, b) => a.price - b.price);
  if (criteria === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
  if (criteria === 'rating') return sorted.sort((a, b) => b.rating - a.rating);
  return sorted;
}

export { getFeaturedBooks, searchBooks, sortBooks, getBookFromDb, VALID_GENRES, VALID_FORMATS, VALID_LANGUAGES };
