import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import NotFound from '@/pages/NotFound';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
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
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'COORDENADOR', 'PROFESSOR']}>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
