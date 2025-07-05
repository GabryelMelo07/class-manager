import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import NotFound from '@/pages/NotFound';
import { RefreshDataProvider } from '@/context/RefreshDataContext';
import ExportSchedules from '@/pages/ExportSchedules';
import ExportTeachersSchedules from '@/pages/ExportTeacherSchedules';
import ResetPassword from './pages/ResetPassword';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <RefreshDataProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              visibleToasts={3}
              toastOptions={{
                duration: 3000,
                classNames: {
                  toast: 'font-sans text-sm',
                },
              }}
            />

            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/export-schedules"
                element={
                  <PrivateRoute>
                    <ExportSchedules />
                  </PrivateRoute>
                }
              />
              <Route
                path="/export-schedules-by-teacher"
                element={
                  <PrivateRoute>
                    <ExportTeachersSchedules />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RefreshDataProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
