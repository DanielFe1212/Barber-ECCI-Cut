import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Citas from './pages/Citas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/registro" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element= {<Login />} />
        <Route path="/citas" element= {<Citas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;