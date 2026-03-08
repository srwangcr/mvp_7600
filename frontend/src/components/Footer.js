import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Ayuda Tica</Typography>
            <Typography variant="body2">
              Plataforma solidaria para conectar a quienes necesitan ayuda con donantes,
              y reportar violaciones a la Ley 7600 de accesibilidad en Costa Rica.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Enlaces</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={Link} to="/casos" color="inherit">Casos de Ayuda</MuiLink>
              <MuiLink component={Link} to="/reportes" color="inherit">Reportes Ley 7600</MuiLink>
              <MuiLink component={Link} to="/mapa" color="inherit">Mapa</MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Legal</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              ⚠️ Los reportes en esta plataforma no sustituyen denuncias formales ante
              la Defensoría de los Habitantes o el CONAPDIS.
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
          <Typography variant="body2">
            © 2026 Ayuda Tica. Hecho con ❤️ en Costa Rica 🇨🇷
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
