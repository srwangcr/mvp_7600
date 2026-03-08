import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Casos from './pages/Casos';
import CasoDetail from './pages/CasoDetail';
import CrearCaso from './pages/CrearCaso';
import Reportes from './pages/Reportes';
import ReporteDetail from './pages/ReporteDetail';
import CrearReporte from './pages/CrearReporte';
import Mapa from './pages/Mapa';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, mt: 8, mb: 4 }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/casos" element={<Casos />} />
          <Route path="/casos/:id" element={<CasoDetail />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reportes/:id" element={<ReporteDetail />} />
          <Route path="/mapa" element={<Mapa />} />

          {/* Rutas privadas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/crear-caso" element={<PrivateRoute><CrearCaso /></PrivateRoute>} />
          <Route path="/crear-reporte" element={<PrivateRoute><CrearReporte /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['moderador', 'administrador']}><AdminPanel /></PrivateRoute>} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
