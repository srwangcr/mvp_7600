import React from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const ReporteDetail = () => {
  const { id } = useParams();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3">Detalle del Reporte #{id}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        TODO: Implementar vista detallada del reporte con información completa, evidencias, ubicación en mapa, estado, etc.
      </Typography>
    </Container>
  );
};

export default ReporteDetail;
