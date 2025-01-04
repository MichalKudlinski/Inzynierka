import { Button, Grid, TextField, Typography } from "@material-ui/core/";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



const LoginPage = () => {
    const navigate = useNavigate(); // Initialize navigate hook here
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Retrieve and set CSRF token when the component mounts
        const getCookie = (name) => {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith(`${name}=`)) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        };

        const csrfToken = getCookie('csrftoken'); // Django's default CSRF cookie name
        setCsrfToken(csrfToken);
    }, []);

    // Handle input field change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'name') {
            setName(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    // Handle Login button press
    const handleLoginButtonPressed = () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // Add CSRF token to the headers
            },
            body: JSON.stringify({
                name,
                password,
            }),
        };

        fetch('/api/user/token/', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        return response.json().then((data) => {
                            throw new Error(data.error || 'Invalid login credentials'); // Display server's error message or default message
                        });
                    }
                    throw new Error('Something went wrong. Please try again.');
                }
                return response.json();
            })
            .then((data) => {
                // Handle success: Store token in headers and navigate to /main
                const token = data.token;
                console.log('Login successful:', data);

                // Store token for future requests
                localStorage.setItem('token', token);

                setErrorMessage(''); // Clear any previous error messages
                navigate('/main'); // Navigate to /main
            })
            .catch((error) => {
                setErrorMessage(error.message);
                console.error('Error during login:', error);
            });
    };

    return (
        <Grid
            container
            spacing={2}
            direction="column"
            alignItems="center"
            style={{ minHeight: '100vh', marginTop: '5px' }}
        >
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4" style={{ marginBottom: '30px' }}>
                    Log In
                </Typography>
            </Grid>

            {errorMessage && (
                <Grid item xs={12} sm={8} md={6} lg={10} style={{ marginBottom: '20px' }}>
                    <Typography color="error" variant="body1">
                        {errorMessage}
                    </Typography>
                </Grid>
            )}

            <Grid item xs={12} sm={8} md={6} lg={10}>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    style={{ marginBottom: '20px' }}
                    size="medium"
                    InputProps={{
                        style: { fontSize: '1.2rem', padding: '10px' },
                    }}
                    InputLabelProps={{
                        style: { fontSize: '1.5rem' },
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={8} md={6} lg={10}>
                <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    style={{ marginBottom: '30px' }}
                    size="medium"
                    InputProps={{
                        style: { fontSize: '1.2rem', padding: '10px' },
                    }}
                    InputLabelProps={{
                        style: { fontSize: '1.5rem' },
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={8} md={6} lg={10}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLoginButtonPressed}
                    style={{ padding: '15px', fontSize: '1.2rem' }}
                >
                    Login
                </Button>
            </Grid>
        </Grid>
    );
};

export default LoginPage;