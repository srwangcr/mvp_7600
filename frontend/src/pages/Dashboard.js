import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Add, Favorite, Report, Notifications } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Bienvenido, {user?.nombre}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Panel de control - {user?.rol}
      </Typography>

      {/* Acciones rápidas */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>Acciones Rápidas</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/crear-caso"
              sx={{ py: 2 }}
            >
              Crear Caso
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              component={Link}
              to="/crear-reporte"
              sx={{ py: 2 }}
            >
              Crear Reporte
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Resumen */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Favorite sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="text.secondary">Mis Casos</Typography>
                </Box>
              </Box>
              <Button size="small" component={Link} to="/casos">Ver todos</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Report sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="text.secondary">Mis Reportes</Typography>
                </Box>
              </Box>
              <Button size="small" component={Link} to="/reportes">Ver todos</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">0</Typography>
                  <Typography variant="body2" color="text.secondary">Notificaciones</Typography>
                </Box>
              </Box>
              <Button size="small">Ver todas</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Panel de administración */}
      {['moderador', 'administrador'].includes(user?.rol) && (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Panel de Administración</Typography>
              <Typography variant="body2" gutterBottom>
                Tienes acceso al panel de administración.
              </Typography>
              <Button variant="contained" color="secondary" component={Link} to="/admin" sx={{ mt: 2 }}>
                Ir al Panel de Admin
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
