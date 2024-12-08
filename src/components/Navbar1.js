import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const linkStyle = { color: "white", marginRight: "15px" };
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if publicKey exists in sessionStorage
    const publicKey = sessionStorage.getItem("publicKey");
    setIsLoggedIn(!!publicKey); // Update state based on presence of publicKey
  }, []);

  const handleClick = (e) => {
    if (isLoggedIn) {
      alert("You are already logged in!");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("publicKey"); // Clear publicKey from sessionStorage
    setIsLoggedIn(false); // Update state
    alert("You are logged out!");
  };

  return (
    <AppBar position="fixed" style={{ backgroundColor: "#a2856d" }}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Typography variant="h6" style={{ color: "white" }}>
        </Typography>

        <div>
          <Button component={Link} to="/polls" style={linkStyle}>
            VIEW POLLS
          </Button>
          <Button component={Link} to="/create-poll" style={linkStyle}>
            CREATE POLL
          </Button>                    
          <Button component={Link} to="/userinfo" style={linkStyle}>
            YOUR VOTES
          </Button>
          <Button component={Link}  to={isLoggedIn ? "#" : "/login"}  onClick={handleClick} style={linkStyle} >
            {isLoggedIn ? "Logined" : "VOTER LOGIN"}
          </Button>
          {isLoggedIn && (
            <Button style={linkStyle} onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
