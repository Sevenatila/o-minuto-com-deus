// Utility functions for Bible API using alternative sources
// Using https://bible-api.deno.dev/ as the primary source (Portuguese support)

export interface BibleBook {
  abbrev: { pt: string; en: string };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: {
    number: number;
    verses: number;
  };
  verses: BibleVerse[];
}

// Bible books data (static) - Portuguese Bible
const BIBLE_BOOKS: BibleBook[] = [
  { abbrev: { pt: 'gn', en: 'gen' }, author: 'Moisés', chapters: 50, group: 'Pentateuco', name: 'Gênesis', testament: 'VT' },
  { abbrev: { pt: 'ex', en: 'exo' }, author: 'Moisés', chapters: 40, group: 'Pentateuco', name: 'Êxodo', testament: 'VT' },
  { abbrev: { pt: 'lv', en: 'lev' }, author: 'Moisés', chapters: 27, group: 'Pentateuco', name: 'Levítico', testament: 'VT' },
  { abbrev: { pt: 'nm', en: 'num' }, author: 'Moisés', chapters: 36, group: 'Pentateuco', name: 'Números', testament: 'VT' },
  { abbrev: { pt: 'dt', en: 'deu' }, author: 'Moisés', chapters: 34, group: 'Pentateuco', name: 'Deuteronômio', testament: 'VT' },
  { abbrev: { pt: 'js', en: 'jos' }, author: 'Josué', chapters: 24, group: 'Históricos', name: 'Josué', testament: 'VT' },
  { abbrev: { pt: 'jz', en: 'jdg' }, author: 'Samuel', chapters: 21, group: 'Históricos', name: 'Juízes', testament: 'VT' },
  { abbrev: { pt: 'rt', en: 'rut' }, author: 'Samuel', chapters: 4, group: 'Históricos', name: 'Rute', testament: 'VT' },
  { abbrev: { pt: '1sm', en: '1sa' }, author: 'Samuel', chapters: 31, group: 'Históricos', name: '1 Samuel', testament: 'VT' },
  { abbrev: { pt: '2sm', en: '2sa' }, author: 'Samuel', chapters: 24, group: 'Históricos', name: '2 Samuel', testament: 'VT' },
  { abbrev: { pt: '1rs', en: '1ki' }, author: 'Jeremias', chapters: 22, group: 'Históricos', name: '1 Reis', testament: 'VT' },
  { abbrev: { pt: '2rs', en: '2ki' }, author: 'Jeremias', chapters: 25, group: 'Históricos', name: '2 Reis', testament: 'VT' },
  { abbrev: { pt: 'sl', en: 'psa' }, author: 'Davi e outros', chapters: 150, group: 'Poéticos', name: 'Salmos', testament: 'VT' },
  { abbrev: { pt: 'pv', en: 'pro' }, author: 'Salomão', chapters: 31, group: 'Poéticos', name: 'Provérbios', testament: 'VT' },
  { abbrev: { pt: 'is', en: 'isa' }, author: 'Isaías', chapters: 66, group: 'Profetas Maiores', name: 'Isaías', testament: 'VT' },
  { abbrev: { pt: 'jr', en: 'jer' }, author: 'Jeremias', chapters: 52, group: 'Profetas Maiores', name: 'Jeremias', testament: 'VT' },
  { abbrev: { pt: 'mt', en: 'mat' }, author: 'Mateus', chapters: 28, group: 'Evangelhos', name: 'Mateus', testament: 'NT' },
  { abbrev: { pt: 'mc', en: 'mrk' }, author: 'Marcos', chapters: 16, group: 'Evangelhos', name: 'Marcos', testament: 'NT' },
  { abbrev: { pt: 'lc', en: 'luk' }, author: 'Lucas', chapters: 24, group: 'Evangelhos', name: 'Lucas', testament: 'NT' },
  { abbrev: { pt: 'jo', en: 'jhn' }, author: 'João', chapters: 21, group: 'Evangelhos', name: 'João', testament: 'NT' },
  { abbrev: { pt: 'at', en: 'act' }, author: 'Lucas', chapters: 28, group: 'Históricos', name: 'Atos', testament: 'NT' },
  { abbrev: { pt: 'rm', en: 'rom' }, author: 'Paulo', chapters: 16, group: 'Cartas de Paulo', name: 'Romanos', testament: 'NT' },
  { abbrev: { pt: '1co', en: '1co' }, author: 'Paulo', chapters: 16, group: 'Cartas de Paulo', name: '1 Coríntios', testament: 'NT' },
  { abbrev: { pt: '2co', en: '2co' }, author: 'Paulo', chapters: 13, group: 'Cartas de Paulo', name: '2 Coríntios', testament: 'NT' },
  { abbrev: { pt: 'gl', en: 'gal' }, author: 'Paulo', chapters: 6, group: 'Cartas de Paulo', name: 'Gálatas', testament: 'NT' },
  { abbrev: { pt: 'ef', en: 'eph' }, author: 'Paulo', chapters: 6, group: 'Cartas de Paulo', name: 'Efésios', testament: 'NT' },
  { abbrev: { pt: 'fp', en: 'php' }, author: 'Paulo', chapters: 4, group: 'Cartas de Paulo', name: 'Filipenses', testament: 'NT' },
  { abbrev: { pt: 'cl', en: 'col' }, author: 'Paulo', chapters: 4, group: 'Cartas de Paulo', name: 'Colossenses', testament: 'NT' },
  { abbrev: { pt: '1ts', en: '1th' }, author: 'Paulo', chapters: 5, group: 'Cartas de Paulo', name: '1 Tessalonicenses', testament: 'NT' },
  { abbrev: { pt: '2ts', en: '2th' }, author: 'Paulo', chapters: 3, group: 'Cartas de Paulo', name: '2 Tessalonicenses', testament: 'NT' },
  { abbrev: { pt: '1tm', en: '1ti' }, author: 'Paulo', chapters: 6, group: 'Cartas de Paulo', name: '1 Timóteo', testament: 'NT' },
  { abbrev: { pt: '2tm', en: '2ti' }, author: 'Paulo', chapters: 4, group: 'Cartas de Paulo', name: '2 Timóteo', testament: 'NT' },
  { abbrev: { pt: 'tt', en: 'tit' }, author: 'Paulo', chapters: 3, group: 'Cartas de Paulo', name: 'Tito', testament: 'NT' },
  { abbrev: { pt: 'fm', en: 'phm' }, author: 'Paulo', chapters: 1, group: 'Cartas de Paulo', name: 'Filemom', testament: 'NT' },
  { abbrev: { pt: 'hb', en: 'heb' }, author: 'Desconhecido', chapters: 13, group: 'Cartas Gerais', name: 'Hebreus', testament: 'NT' },
  { abbrev: { pt: 'tg', en: 'jas' }, author: 'Tiago', chapters: 5, group: 'Cartas Gerais', name: 'Tiago', testament: 'NT' },
  { abbrev: { pt: '1pe', en: '1pe' }, author: 'Pedro', chapters: 5, group: 'Cartas Gerais', name: '1 Pedro', testament: 'NT' },
  { abbrev: { pt: '2pe', en: '2pe' }, author: 'Pedro', chapters: 3, group: 'Cartas Gerais', name: '2 Pedro', testament: 'NT' },
  { abbrev: { pt: '1jo', en: '1jn' }, author: 'João', chapters: 5, group: 'Cartas Gerais', name: '1 João', testament: 'NT' },
  { abbrev: { pt: '2jo', en: '2jn' }, author: 'João', chapters: 1, group: 'Cartas Gerais', name: '2 João', testament: 'NT' },
  { abbrev: { pt: '3jo', en: '3jn' }, author: 'João', chapters: 1, group: 'Cartas Gerais', name: '3 João', testament: 'NT' },
  { abbrev: { pt: 'jd', en: 'jud' }, author: 'Judas', chapters: 1, group: 'Cartas Gerais', name: 'Judas', testament: 'NT' },
  { abbrev: { pt: 'ap', en: 'rev' }, author: 'João', chapters: 22, group: 'Profecia', name: 'Apocalipse', testament: 'NT' },
];

export async function getBooks(): Promise<BibleBook[]> {
  // Return static book list immediately
  return BIBLE_BOOKS;
}

export async function getChapter(
  bookAbbrev: string,
  chapterNum: number
): Promise<BibleChapter | null> {
  try {
    // Find the book
    const book = BIBLE_BOOKS.find(b => b.abbrev.pt === bookAbbrev);
    if (!book) {
      console.error('Book not found:', bookAbbrev);
      return null;
    }

    // Map Portuguese abbreviations to English for bible-api
    const enAbbrev = book.abbrev.en;
    
    // Try bible-api.com (which has Portuguese Almeida)
    const response = await fetch(
      `https://bible-api.com/${enAbbrev}+${chapterNum}?translation=almeida`,
      {
        cache: 'no-store',
      }
    );

    if (!response?.ok) {
      throw new Error('Failed to fetch chapter from bible-api');
    }

    const data = await response.json();
    
    // Transform the response to match our expected format
    const verses: BibleVerse[] = data.verses?.map((v: any) => ({
      number: v.verse,
      text: v.text.trim(),
    })) || [];

    return {
      book: {
        abbrev: book.abbrev,
        name: book.name,
        author: book.author,
        group: book.group,
        version: 'Almeida',
      },
      chapter: {
        number: chapterNum,
        verses: verses.length,
      },
      verses,
    };
  } catch (error) {
    console.error('Error fetching chapter:', error);
    // Return a mock chapter with sample verses if API fails
    return createMockChapter(bookAbbrev, chapterNum);
  }
}

// Fallback function to create mock chapters when API is unavailable
function createMockChapter(bookAbbrev: string, chapterNum: number): BibleChapter | null {
  const book = BIBLE_BOOKS.find(b => b.abbrev.pt === bookAbbrev);
  if (!book) return null;

  // Sample verses for demonstration
  const mockVerses: BibleVerse[] = [
    { number: 1, text: 'Este é um verso de exemplo. A API da Bíblia está temporariamente indisponível.' },
    { number: 2, text: 'Deus é amor, e aquele que permanece em amor permanece em Deus, e Deus nele.' },
    { number: 3, text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.' },
    { number: 4, text: 'O Senhor é o meu pastor; nada me faltará.' },
    { number: 5, text: 'Bem-aventurados os puros de coração, porque verão a Deus.' },
  ];

  return {
    book: {
      abbrev: book.abbrev,
      name: book.name,
      author: book.author,
      group: book.group,
      version: 'Almeida (Demo)',
    },
    chapter: {
      number: chapterNum,
      verses: mockVerses.length,
    },
    verses: mockVerses,
  };
}

export function getRandomChapter(books: BibleBook[]): {
  book: string;
  chapter: number;
} | null {
  if (!books?.length) return null;
  
  const randomBook = books[Math.floor(Math.random() * books.length)];
  const randomChapter = Math.floor(Math.random() * (randomBook?.chapters ?? 1)) + 1;
  
  return {
    book: randomBook?.abbrev?.pt ?? 'gn',
    chapter: randomChapter,
  };
}
