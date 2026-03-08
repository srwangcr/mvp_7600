import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Mapa = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 200px)' }}>
      <Typography variant="h3" gutterBottom>Mapa Interactivo</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Visualiza casos de ayuda y reportes en el mapa de Costa Rica.
      </Typography>
      
      <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          TODO: Implementar mapa con React Leaflet mostrando:
          - Marcadores de casos de ayuda (íconos rojos)
          - Marcadores de reportes Ley 7600 (íconos azules)
          - Popups con información al hacer clic
          - Filtros por categoría
          - Geolocalización del usuario
        </Typography>
      </Paper>
    </Container>
  );
};

export default Mapa;
