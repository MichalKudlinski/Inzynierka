import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const HomePage = () => {
    const navigate = useNavigate(); // Get navigate function

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            style={{ minHeight: '100vh', marginTop: '20px' }}
        >
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h1" style={{ marginBottom: '30px' }}>
                    Welcome to the Home Page
                </Typography>
            </Grid>

            {/* Sign Up Button */}
            <Grid item xs={12} sm={8} md={6} lg={6} align="center" style={{ marginBottom: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/signup')} // Navigate to /signup when clicked
                    style={{
                        padding: '15px',
                        fontSize: '1.2rem',
                    }}
                >
                    Sign Up
                </Button>
            </Grid>

            {/* Login Button */}
            <Grid item xs={12} sm={8} md={6} lg={6} align="center">
                <Button
                    variant="contained"
                    color="secondaryDark"
                    fullWidth
                    onClick={() => navigate('/login')} // Navigate to /login when clicked
                    style={{
                        padding: '15px',
                        fontSize: '1.2rem',
                    }}
                >
                    Login
                </Button>
            </Grid>
        </Grid>
    );
};

export default HomePage;