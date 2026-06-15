import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, hasFirebaseConfig } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { saveUserToDb, getUserProfile, updateUserProfile } from '../services/db';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

// Fallback user for demo purposes if Firebase is not configured
const MOCK_USER = {
  uid: 'demo-user-123',
  displayName: 'אורח (Demo)',
  email: 'demo@community.library',
  photoURL: 'https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff',
  phone: '050-0000000',
  isAdmin: true
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const [isDemoMode, setIsDemoMode] = useState(!hasFirebaseConfig);

  async function loginWithGoogle() {
    if (!hasFirebaseConfig) {
      setCurrentUser(MOCK_USER);
      setUserProfile(MOCK_USER);
      setIsDemoMode(true);
      return { user: MOCK_USER };
    }
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    if (!hasFirebaseConfig) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    return signOut(auth);
  }

  async function completeProfile(displayName, phone) {
    if (!currentUser) return;
    const updatedData = { displayName, phone };
    await updateUserProfile(currentUser.uid, updatedData);
    setUserProfile(prev => ({ ...prev, ...updatedData }));
  }

  useEffect(() => {
    if (!hasFirebaseConfig) {
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch existing profile
          const profile = await getUserProfile(user.uid);
          
          if (profile && profile.phone) {
             setUserProfile({
               ...profile,
               isAdmin: user.email === 'idobi.renboim.ido@gmail.com'
             });
          } else {
             // Profile is incomplete (missing phone). We set the userProfile without phone, which triggers the onboarding modal.
             setUserProfile({ 
               uid: user.uid, 
               displayName: user.displayName, 
               email: user.email, 
               photoURL: user.photoURL,
               isAdmin: user.email === 'idobi.renboim.ido@gmail.com'
             });
          }
          await saveUserToDb(user); // ensures basic google data is saved if not exists
        } catch (error) {
          console.error("Failed to fetch/save user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loginWithGoogle,
    logout,
    completeProfile,
    hasFirebaseConfig,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <h2>טוען מערכת...</h2>
          <p className="text-muted">מתחבר למסד הנתונים</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
