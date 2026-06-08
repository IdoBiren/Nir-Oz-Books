import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Library, BookOpen, MessageCircle } from 'lucide-react';
import { getAvailableBooks } from '../services/db';

export default function Home() {
  const { currentUser, isDemoMode } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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
          ) : books.length > 0 ? (
            books.map(book => (
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
                      <a href={`https://wa.me/${book.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`היי ${book.ownerName}! 👋 ראיתי את הספר "${book.title}" בספריית ניר עוז וממש אשמח להשאיל אותו אם אפשר. תודה מראש! 📚✨`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', gap: '0.4rem', background: '#25D366', borderColor: '#25D366' }} title="שלח וואטסאפ">
                        <MessageCircle size={16} /> בקש
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card text-center hover-lift" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
               <BookOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
               <h3>אין ספרים זמינים כרגע</h3>
               <p className="text-muted mt-2">היו הראשונים להוסיף ספר לספרייה!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
