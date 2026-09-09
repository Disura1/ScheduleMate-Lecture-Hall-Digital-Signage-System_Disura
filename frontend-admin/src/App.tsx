import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AcademicPage } from './pages/AcademicPage';
import { StructurePage } from './pages/StructurePage';
import { SessionsPage } from './pages/SessionsPage';
import { DisplaysPage } from './pages/DisplaysPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/academic" element={<AcademicPage />} />
              <Route path="/structure" element={<StructurePage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/displays" element={<DisplaysPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* more pages will be added here as we build them */}
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;