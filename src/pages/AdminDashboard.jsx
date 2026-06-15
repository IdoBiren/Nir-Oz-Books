import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { getAllBooksAdmin, deleteBook, editBook, uploadBookCover } from '../services/db';

export default function AdminDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', genre: '', status: '' });
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.isAdmin) {
      loadAllBooks();
    }
  }, [userProfile]);

  const loadAllBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await getAllBooksAdmin();
      setBooks(allBooks);
    } catch (err) {
      console.error("Error loading admin books:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !userProfile?.isAdmin) {
    return (
      <div className="text-center mt-12 glass-card">
        <ShieldAlert size={48} color="var(--danger-color)" style={{ margin: '0 auto 1rem' }} />
        <h2>גישה חסומה</h2>
        <p>אין לך הרשאות ניהול לצפייה בעמוד זה.</p>
      </div>
    );
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`האם למחוק לצמיתות את הספר "${title}" מכל המערכת? פעולה זו אינה הפיכה!`)) {
      try {
        await deleteBook(id);
        setBooks(books.filter(b => b.id !== id));
      } catch (err) {
        console.error("Error deleting book:", err);
        alert("שגיאה במחיקת הספר.");
      }
    }
  };

  const startEdit = (book) => {
    setEditingBookId(book.id);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      status: book.status || 'available'
    });
    setNewCoverFile(null);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      let updatedData = { ...editForm };
      
      if (newCoverFile) {
        const downloadUrl = await uploadBookCover(newCoverFile, editingBookId);
        if (downloadUrl) {
          updatedData.coverImage = downloadUrl;
        }
      }
      
      await editBook(editingBookId, updatedData);
      setBooks(books.map(b => b.id === editingBookId ? { ...b, ...updatedData } : b));
      setEditingBookId(null);
    } catch (err) {
      console.error("Error saving book:", err);
      alert("שגיאה בשמירת הספר.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-12"><Loader2 size={32} className="spin text-muted" /></div>;
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2>ניהול מאגר הספרים 👑</h2>
        <div className="text-muted">סה"כ ספרים: {books.length}</div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--surface-border)', background: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem' }}>תמונה</th>
              <th style={{ padding: '1rem' }}>פרטי הספר</th>
              <th style={{ padding: '1rem' }}>בעלים</th>
              <th style={{ padding: '1rem' }}>סטטוס</th>
              <th style={{ padding: '1rem' }}>פעולות מנהל</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1rem' }}>
                  <img src={book.coverImage} alt={book.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                
                {editingBookId === book.id ? (
                  // עריכה
                  <td colSpan="3" style={{ padding: '1rem' }}>
                    <div className="grid" style={{ gap: '0.5rem' }}>
                      <input 
                        type="text" className="input" placeholder="שם הספר"
                        value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} 
                      />
                      <input 
                        type="text" className="input" placeholder="סופר"
                        value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} 
                      />
                      <div className="flex items-center gap-2">
                         <label className="text-sm">עדכון תמונה:</label>
                         <input type="file" accept="image/*" onChange={e => setNewCoverFile(e.target.files[0])} style={{ fontSize: '0.8rem' }} />
                      </div>
                    </div>
                  </td>
                ) : (
                  // תצוגה
                  <>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{book.title}</div>
                      <div className="text-sm text-muted">{book.author}</div>
                      <div className="text-sm text-muted">ז'אנר: {book.genre}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{book.ownerName}</div>
                      <div className="text-sm text-muted">{book.ownerPhone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {book.status === 'available' ? (
                        <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>זמין</span>
                      ) : (
                        <div>
                          <span style={{ color: 'var(--warning-color)', fontWeight: 600 }}>מושאל ל: {book.borrowerName}</span>
                          <div className="text-sm">עד: {book.dueDate}</div>
                        </div>
                      )}
                    </td>
                  </>
                )}

                <td style={{ padding: '1rem' }}>
                  {editingBookId === book.id ? (
                     <div className="flex gap-2">
                        <button onClick={handleSaveEdit} disabled={isSaving} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                          {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        </button>
                        <button onClick={() => setEditingBookId(null)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                          <X size={16} />
                        </button>
                     </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(book)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="ערוך ספר">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(book.id, book.title)} className="btn" style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626' }} title="מחק ספר לצמיתות">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {books.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                  אין ספרים במערכת כרגע.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
