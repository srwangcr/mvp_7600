import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, Chip, Box, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const Casos = () => {
  // TODO: Implementar llamada a API para obtener casos
  const casos = [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">Casos de Ayuda</Typography>
        <Button variant="contained" component={Link} to="/crear-caso">
          Crear Caso
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Encuentra casos de personas que necesitan ayuda en Costa Rica. Dona y marca la diferencia.
      </Typography>

      {casos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay casos disponibles en este momento.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sé el primero en crear un caso de ayuda.
          </Typography>
          <Button variant="contained" component={Link} to="/crear-caso" sx={{ mt: 3 }}>
            Crear Caso
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {casos.map((caso) => (
            <Grid item xs={12} sm={6} md={4} key={caso.id}>
              <Card className="caso-card">
                {caso.fotos && caso.fotos[0] && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={caso.fotos[0]}
                    alt={caso.titulo}
                  />
                )}
                <CardContent>
                  <Chip label={caso.categoria} size="small" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>{caso.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {caso.descripcion}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      ₡{caso.monto_recaudado} / ₡{caso.monto_solicitado}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(caso.monto_recaudado / caso.monto_solicitado) * 100} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} to={`/casos/${caso.id}`}>
                    Ver Detalle
                  </Button>
                  <Button size="small" color="secondary">
                    Donar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Casos;
