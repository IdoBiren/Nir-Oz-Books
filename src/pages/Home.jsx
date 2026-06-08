import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Library, BookOpen, MessageCircle, Search, Filter, ArrowUpDown } from 'lucide-react';
import { getAvailableBooks } from '../services/db';
import { BOOK_GENRES } from '../utils/constants';

export default function Home() {
  const { currentUser, isDemoMode } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort logic
  const filteredBooks = books.filter(book => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = book.title?.toLowerCase().includes(searchLower);
    const authorMatch = book.author?.toLowerCase().includes(searchLower);
    const matchesSearch = !searchQuery || titleMatch || authorMatch;
    
    const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
    
    return matchesSearch && matchesGenre;
  }).sort((a, b) => {
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title, 'he');
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title, 'he');
    if (sortBy === 'author-asc') return a.author.localeCompare(b.author, 'he');
    // Default to newest
    const dateA = a.createdAt?.seconds || Date.parse(a.createdAt) || 0;
    const dateB = b.createdAt?.seconds || Date.parse(b.createdAt) || 0;
    return dateB - dateA;
  });

  useEffect(() => {
    async function fetchBooks() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      const timeoutId = setTimeout(() => setLoading(false), 3000);
      
      try {
        const availableBooks = await getAvailableBooks();
        setBooks(availableBooks);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchBooks();
  }, [currentUser]);

  return (
    <div className="animate-fade-in">
      {isDemoMode && (
        <div className="glass-card mb-4" style={{ borderColor: 'var(--warning-color)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <p className="text-center" style={{ color: 'var(--warning-color)', fontWeight: 600 }}>
            שימו לב: האפליקציה רצה במצב הדגמה (Demo) כיוון ש-Firebase לא הוגדר. מידע ישמר באופן מקומי בלבד.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <div className="glass-card flex flex-col md:flex-row gap-4" style={{ padding: '1.5rem', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div className="input-group" style={{ flex: '1 1 300px', margin: 0 }}>
            <div className="flex items-center gap-2" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="חיפוש חופשי (שם ספר, סופר...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '2.5rem', marginBottom: 0 }}
              />
            </div>
          </div>
          
          <div className="flex gap-4" style={{ flex: '1 1 300px', width: '100%' }}>
            <div className="input-group" style={{ flex: 1, margin: 0, position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
              <select className="input-field" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} style={{ paddingRight: '2.5rem', marginBottom: 0, cursor: 'pointer' }}>
                <option value="">כל הקטגוריות</option>
                {BOOK_GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ flex: 1, margin: 0, position: 'relative' }}>
              <ArrowUpDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
              <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ paddingRight: '2.5rem', marginBottom: 0, cursor: 'pointer' }}>
                <option value="newest">הכי חדשים</option>
                <option value="title-asc">שם הספר (א-ת)</option>
                <option value="title-desc">שם הספר (ת-א)</option>
                <option value="author-asc">שם הסופר (א-ת)</option>
              </select>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="mb-4" style={{ fontSize: '2.5rem' }}>הספרים הזמינים בקהילה</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem' }}>מצאו ספרים מעניינים להשאלה מחברי הקהילה שלכם</p>
      </div>

      {!currentUser ? (
        <div className="glass-card text-center hover-lift" style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <Library size={64} style={{ color: 'var(--primary-color)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h2>התחברו כדי לצפות ולהשאיל ספרים</h2>
          <p className="text-muted mt-2">התחברו עם חשבון הגוגל שלכם בלחיצת כפתור אחת למעלה ותתחילו להשאיל!</p>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          {loading ? (
            <div className="glass-card text-center" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
              <h3>טוען ספרים...</h3>
            </div>
          ) : books.length === 0 ? (
            <div className="glass-card text-center hover-lift" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
               <BookOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
               <h3>אין ספרים זמינים כרגע</h3>
               <p className="text-muted mt-2">היו הראשונים להוסיף ספר לספרייה!</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="glass-card text-center" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
              <h3>לא נמצאו ספרים תואמים לחיפוש שלך</h3>
              <button className="btn btn-secondary mt-4" onClick={() => { setSearchQuery(''); setSelectedGenre(''); }}>נקה סינונים</button>
            </div>
          ) : (
            filteredBooks.map(book => (
              <div key={book.id} className="glass-card flex flex-col hover-lift" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '240px', width: '100%', overflow: 'hidden' }}>
                  <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="flex-col justify-between flex" style={{ padding: '1.5rem', flex: 1 }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>{book.title}</h4>
                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>{book.author}</p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: '600' }}>{book.genre}</p>
                  </div>
                  <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>שייך ל: <strong>{book.ownerName}</strong></p>
                    {book.ownerPhone && (
                      <a href={`https://api.whatsapp.com/send?phone=${book.ownerPhone.replace(/\D/g, '').replace(/^0/, '972')}&text=${encodeURIComponent(`היי ${book.ownerName}! 👋 ראיתי את הספר "${book.title}" בספריית ניר עוז וממש אשמח להשאיל אותו אם אפשר. תודה מראש! 📚✨`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', gap: '0.4rem', background: '#25D366', borderColor: '#25D366' }} title="שלח וואטסאפ">
                        <MessageCircle size={16} /> בקש
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
