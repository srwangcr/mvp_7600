import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Panel de Administración
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Rol: {user?.rol}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">Usuarios</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">Casos Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">Reportes Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">0</Typography>
              <Typography variant="body2" color="text.secondary">Donaciones Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          TODO: Implementar funcionalidades de admin:
          - Lista de usuarios con gestión de roles
          - Aprobación/rechazo de casos
          - Aprobación de reportes y asignación a autoridades
          - Verificación de donaciones
          - Estadísticas detalladas
          - Actividad reciente
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminPanel;
