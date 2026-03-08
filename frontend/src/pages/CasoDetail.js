import React from 'react';
import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const CasoDetail = () => {
  const { id } = useParams();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3">Detalle del Caso #{id}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        TODO: Implementar vista detallada del caso con información completa, fotos, donaciones, etc.
      </Typography>
    </Container>
  );
};

export default CasoDetail;
