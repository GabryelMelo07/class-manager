import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { Login } from '@/pages/Login';
import { Home } from './pages/Home';

// TODO: Criar uma página de Not Found e direcionar todos requests para rotas que não existem para esta página.
export function App() {
  return (
    <Router>
      <AuthProvider>
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
          {/* <Route path="/unauthorized" element={<div>Acesso negado.</div>} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}
