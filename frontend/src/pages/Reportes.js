import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Chip, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Reportes = () => {
  const reportes = [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">Reportes Ley 7600</Typography>
        <Button variant="contained" color="secondary" component={Link} to="/crear-reporte">
          Crear Reporte
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Reporta violaciones a la Ley 7600 de accesibilidad en Costa Rica.
      </Typography>

      {reportes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay reportes disponibles.
          </Typography>
          <Button variant="contained" color="secondary" component={Link} to="/crear-reporte" sx={{ mt: 3 }}>
            Crear Reporte
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reportes.map((reporte) => (
            <Grid item xs={12} sm={6} md={4} key={reporte.id}>
              <Card>
                <CardContent>
                  <Chip label={reporte.categoria} size="small" color="secondary" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>{reporte.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reporte.descripcion}
                  </Typography>
                  <Button size="small" component={Link} to={`/reportes/${reporte.id}`} sx={{ mt: 2 }}>
                    Ver Detalle
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Reportes;
