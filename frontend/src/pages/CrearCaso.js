import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CrearCaso = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Crear Caso de Ayuda</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          TODO: Implementar formulario para crear casos con campos:
          - Título
          - Descripción
          - Monto solicitado
          - Categoría
          - Urgencia
          - Ubicación (mapa)
          - Fotos (upload múltiple)
          - Fecha límite
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CrearCaso;
