import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';
import Footer from './components/layout/Footer';

// Pages
import LegalPages from './pages/Legal/PolicyPage';
import LandingPage from './pages/LandingPage';
import AuthFlow from './pages/AuthFlow';
import SearchPage from './pages/SearchPage';
import Dashboard from './pages/Dashboard';
import BrowsePage from './pages/BrowsePage';
import ProfilePage from './pages/ProfilePage';
import BookingFlow from './pages/BookingFlow';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import ProfileSetupWizard from './pages/ProfileSetupWizard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen text-slate-200 bg-darkBg">
        {/* Navigation Bar */}
        <Navbar />

        {/* Global Floating Notifications */}
        <ToastContainer />

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthFlow />} />
            <Route path="/login" element={<AuthFlow />} />
            <Route path="/signup" element={<AuthFlow />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            
            {/* Legal Routes */}
            <Route path="/legal/:page" element={<LegalPages />} />
            <Route path="/privacy" element={<LegalPages />} />
            <Route path="/terms" element={<LegalPages />} />
            <Route path="/safety" element={<LegalPages />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute allowedRoles={['jigolo']}>
                  <ProfileSetupWizard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking/:profileId" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BookingFlow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
        
        {/* Footer Area */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
