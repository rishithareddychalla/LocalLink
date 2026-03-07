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
import NotFound from './pages/NotFound';
import ConnectionLost from './pages/ConnectionLost';
import SystemErrorBoundary from './components/SystemErrorBoundary';
import SystemError from './pages/SystemError';
import { startNetworkMonitor } from './utils/networkMonitor';
import { SessionProvider } from './context/SessionContext';
import { RoomProvider } from './context/RoomContext';
import { FileProvider } from './context/FileContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProfileProvider } from './context/ProfileContext';
import { NetworkLogProvider } from './context/NetworkLogContext';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Start background health monitor
    startNetworkMonitor();

    const handleOffline = () => {
      navigate('/connection-lost');
    };

    const handleOnline = () => {
      // Optional: automatically return to dashboard if on connection-lost page
      if (window.location.pathname === '/connection-lost') {
        navigate('/dashboard');
      }
    };

    const handleSystemError = (event) => {
      navigate('/system-error', { state: event.detail });
    };

    window.addEventListener('llr_network_offline', handleOffline);
    window.addEventListener('llr_network_online', handleOnline);
    window.addEventListener('llr_system_error', handleSystemError);

    return () => {
      window.removeEventListener('llr_network_offline', handleOffline);
      window.removeEventListener('llr_network_online', handleOnline);
      window.removeEventListener('llr_system_error', handleSystemError);
    };
  }, [navigate]);

  return (
    <SystemErrorBoundary>
      <SettingsProvider>
        <NetworkLogProvider>
          <ProfileProvider>
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

                      {/* Error Handling Routes */}
                      <Route path="/connection-lost" element={<ConnectionLost />} />
                      <Route path="/system-error" element={<SystemError />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </RoomProvider>
                </FileProvider>
              </NotificationProvider>
            </SessionProvider>
          </ProfileProvider>
        </NetworkLogProvider>
      </SettingsProvider>
    </SystemErrorBoundary>
  );
};

export default App;
