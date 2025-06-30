import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setCredentials } from './store/authSlice';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BlogListPage from './pages/BlogListPage';
import BlogEditorPage from './pages/BlogEditorPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import UserProfilePage from './pages/UserProfilePage';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const dispatch = useDispatch();

  // Rehydrate Redux state from localStorage on app load
  useEffect(() => {
    const user = localStorage.getItem('authUser');
    const token = localStorage.getItem('authToken');
    if (user && token) {
      dispatch(setCredentials({ user: JSON.parse(user), token }));
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/create" element={<BlogEditorPage />} />
          <Route path="/blogs/edit/:blogId" element={<BlogEditorPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetailsPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
