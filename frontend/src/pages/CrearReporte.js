import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CrearReporte = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Crear Reporte Ley 7600</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          TODO: Implementar formulario para crear reportes con campos:
          - Título
          - Descripción
          - Categoría (dropdown con opciones de Ley 7600)
          - Ubicación (mapa obligatorio)
          - Dirección exacta
          - Nombre del establecimiento
          - Evidencias (fotos)
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CrearReporte;
