import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite, Report, Map } from '@mui/icons-material';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Bienvenido a Ayuda Tica 🇨🇷
            </Typography>
            <Typography variant="h5" gutterBottom>
              Solidaridad que conecta corazones costarricenses
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Ayuda a quien lo necesita, dona a causas importantes y reporta violaciones
              a la Ley 7600 de accesibilidad en Costa Rica.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" color="secondary" component={Link} to="/casos">
                Ver Casos de Ayuda
              </Button>
              <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white' }} component={Link} to="/reportes">
                Ver Reportes Ley 7600
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" align="center" gutterBottom>
          ¿Cómo funciona?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Favorite sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Casos de Ayuda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Publica tu caso si necesitas ayuda o dona a causas que te importan.
                  Todo verificado por moderadores.
                </Typography>
                <Button sx={{ mt: 2 }} component={Link} to="/crear-caso">
                  Crear Caso
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Report sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Reportes Ley 7600
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reporta violaciones a la accesibilidad en espacios públicos o privados.
                  Las autoridades recibirán notificaciones.
                </Typography>
                <Button sx={{ mt: 2 }} component={Link} to="/crear-reporte">
                  Crear Reporte
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Map sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Mapa Interactivo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualiza casos de ayuda y reportes en un mapa de Costa Rica.
                  Encuentra lo más cercano a ti.
                </Typography>
                <Button sx={{ mt: 2 }} component={Link} to="/mapa">
                  Ver Mapa
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              ¿Listo para hacer la diferencia?
            </Typography>
            <Typography variant="body1" gutterBottom>
              Únete a nuestra comunidad solidaria hoy mismo.
            </Typography>
            <Button variant="contained" size="large" color="primary" component={Link} to="/register" sx={{ mt: 2 }}>
              Registrarse Gratis
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
