import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoomInterface from './pages/RoomInterface';
import FilesManagement from './pages/FilesManagement';
import QuizMode from './pages/QuizMode';
import JoinRoom from './pages/JoinRoom';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Rooms from './pages/Rooms';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import { SessionProvider } from './context/SessionContext';
import { RoomProvider } from './context/RoomContext';
import { FileProvider } from './context/FileContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';

const App = () => {
  return (
    <SettingsProvider>
      <SessionProvider>
        <NotificationProvider>
          <FileProvider>
            <RoomProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/documentation" element={<Documentation />} />

                {/* Protected Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/join/:roomId" element={
                  <ProtectedRoute>
                    <JoinRoom />
                  </ProtectedRoute>
                } />

                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/room/:roomId" element={<RoomInterface />} />
                  <Route path="/files" element={<FilesManagement />} />
                  <Route path="/quiz" element={<QuizMode />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </RoomProvider>
          </FileProvider>
        </NotificationProvider>
      </SessionProvider>
    </SettingsProvider>
  );
};

export default App;
