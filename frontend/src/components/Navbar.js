import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Notifications, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          🇨🇷 Ayuda Tica
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button color="inherit" component={Link} to="/casos">Casos de Ayuda</Button>
          <Button color="inherit" component={Link} to="/reportes">Reportes Ley 7600</Button>
          <Button color="inherit" component={Link} to="/mapa">Mapa</Button>
          
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton color="inherit" onClick={handleMenu}>
                <AccountCircle />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user?.nombre}</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Iniciar Sesión</Button>
              <Button variant="contained" color="secondary" component={Link} to="/register">Registrarse</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
