import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut,
    User
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    doc,
    setDoc
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeHUgCl3Iw7EKXz3miAKaBRcF_dQNoLPw",
    authDomain: "samia-76f47.firebaseapp.com",
    databaseURL: "https://samia-76f47-default-rtdb.firebaseio.com",
    projectId: "samia-76f47",
    storageBucket: "samia-76f47.firebasestorage.app",
    messagingSenderId: "861876890112",
    appId: "1:861876890112:web:cab1d557a3da52866a46e5",
    measurementId: "G-QXMDR3BBT4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const GAMES = ["Grow a Garden", "STK", "MM2", "Stal a Braintrot"];

// --- Helper Functions ---
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Date(timestamp.seconds * 1000).toLocaleString();
};


// --- Components ---

const LoginPage = () => {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Create user document in Firestore if it doesn't exist
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            }, { merge: true });
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };

    return (
        <div className="login-container">
            <h1>Roblox Trade Hub</h1>
            <p>The central place for all your Roblox trading needs. Sign in to start trading!</p>
            <button onClick={signInWithGoogle} className="google-btn">
                <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                <span>Sign in with Google</span>
            </button>
        </div>
    );
};

const CreatePostModal = ({ setShowModal, user }) => {
    const [game, setGame] = useState(GAMES[0]);
    const [offering, setOffering] = useState('');
    const [lookingFor, setLookingFor] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (offering.trim() === '' || lookingFor.trim() === '') {
            alert("Please fill out both 'Offering' and 'Looking For' fields.");
            return;
        }

        try {
            await addDoc(collection(db, 'posts'), {
                uid: user.uid,
                authorName: user.displayName,
                authorPhotoURL: user.photoURL,
                game,
                offering,
                lookingFor,
                createdAt: serverTimestamp()
            });
            setShowModal(false);
        } catch (error) {
            console.error("Error creating post: ", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create a New Trade Post</h2>
                    <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="game-select">Game</label>
                        <select id="game-select" className="form-select" value={game} onChange={(e) => setGame(e.target.value)}>
                            {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="offering-input">Offering</label>
                        <textarea id="offering-input" className="form-textarea" value={offering} onChange={(e) => setOffering(e.target.value)} placeholder="What items are you offering?" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="looking-for-input">Looking For</label>
                        <textarea id="looking-for-input" className="form-textarea" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="What items are you looking for?"/>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="new-post-btn">Post Trade</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// FIX: Define an interface for the post data to improve type safety.
interface PostData {
    authorPhotoURL: string;
    authorName: string;
    game: string;
    offering: string;
    lookingFor: string;
    createdAt?: any;
}

// FIX: Explicitly type the Post component with React.FC to ensure TypeScript
// correctly handles special React props like `key`, resolving the error on line 214.
const Post: React.FC<{ post: PostData }> = ({ post }) => (
    <div className="post-card">
        <div className="post-header">
            <div className="post-user">
                <img src={post.authorPhotoURL} alt={post.authorName} className="post-user-img" />
                <span className="post-user-name">{post.authorName}</span>
            </div>
            <span className="post-game-tag">{post.game}</span>
        </div>
        <div className="post-body">
            <div className="trade-section offering">
                <h3>Offering</h3>
                <pre>{post.offering}</pre>
            </div>
            <div className="trade-section looking-for">
                <h3>Looking For</h3>
                <pre>{post.lookingFor}</pre>
            </div>
        </div>
        <div className="post-footer">
            {formatTimestamp(post.createdAt)}
        </div>
    </div>
);

const TradeApp = ({ user }) => {
    const [showModal, setShowModal] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.game === filter);

    return (
        <div className="app-container">
            {showModal && <CreatePostModal setShowModal={setShowModal} user={user} />}
            <header className="app-header">
                <h1>TradeHub</h1>
                <div className="header-actions">
                    <button onClick={() => setShowModal(true)} className="new-post-btn">+ New Post</button>
                    <div className="profile-menu">
                        <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="profile-img" 
                            onClick={() => setShowLogout(!showLogout)} 
                        />
                        {showLogout && <button onClick={() => signOut(auth)} className="logout-btn">Logout</button>}
                    </div>
                </div>
            </header>
            
            <main>
                <div className="filter-bar">
                    <button onClick={() => setFilter('All')} className={`filter-btn ${filter === 'All' ? 'active' : ''}`}>All</button>
                    {GAMES.map(game => (
                        <button key={game} onClick={() => setFilter(game)} className={`filter-btn ${filter === game ? 'active' : ''}`}>{game}</button>
                    ))}
                </div>
                <div className="feed-container">
                    {filteredPosts.map(post => <Post key={post.id} post={post} />)}
                </div>
            </main>
        </div>
    );
};


const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Or a nice spinner component
    }

    return user ? <TradeApp user={user} /> : <LoginPage />;
};


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);