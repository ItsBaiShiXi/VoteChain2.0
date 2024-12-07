import React from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const linkStyle = { color: 'white', marginRight: '15px' };

  return (
    <AppBar position="fixed" style={{ backgroundColor: '#a2856d' }}>
      <Toolbar style={{ justifyContent: 'space-between' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">
          {/* <Button component={Link} to="/login" style={linkStyle}>Voter Login</Button>
          <Button component={Link} to="/signup" style={linkStyle}>Voter Signup</Button> */}
          {/* <Button component={Link} to="/logout" style={linkStyle}>Logout</Button> */}
        </Typography>
      </Toolbar>
      {/* Responsive Menu */}
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* <MenuItem component={Link} to="/" onClick={handleClose}>Home</MenuItem> */}
        {/* <MenuItem component={Link} to="/signup" onClick={handleClose}>Voter Signup</MenuItem>
        <MenuItem component={Link} to="/login" onClick={handleClose}>Admin Login</MenuItem> */}
      </Menu>
    </AppBar>
  );
};

export default Navbar;
