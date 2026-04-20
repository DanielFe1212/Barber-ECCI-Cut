import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RutaProtegida, RutaAdmin, RutaPublica, RutaBarbero } from './components/RutaProtegida';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Citas from './pages/Citas';
import Admin from './pages/Admin';
import Barbero from './pages/Barbero';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
          <Route path="/citas" element={<RutaProtegida><Citas /></RutaProtegida>} />
          <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
          <Route path="/barbero" element={<RutaBarbero><Barbero /></RutaBarbero>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;