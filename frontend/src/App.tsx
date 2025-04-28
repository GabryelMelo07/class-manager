import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { Login } from '@/pages/Login';
import { Home } from '@/pages/Home';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route 
            path="/login"
            element={<Login />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
