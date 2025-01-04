import { Button, TextField, Typography } from "@material-ui/core/";
import Grid from "@material-ui/core/Grid";
import React, { Component } from "react";


export default class SignUpPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            name: '',
            csrfToken: '', // Store CSRF token in state
            errorMessage: '', // Store error message in state
        };
    }

    componentDidMount() {
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
        this.setState({ csrfToken });
    }

    // Handle input field change
    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
    };

    // Handle Sign Up button press
    handleSignUpButtonPressed = () => {
        const { email, password, name, csrfToken } = this.state;
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // Add CSRF token to the headers
            },
            body: JSON.stringify({
                email,
                password,
                name,
            }),
        };

        fetch('/api/user/create/', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        return response.json().then((data) => {
                            throw new Error(data.error || 'Invalid input'); // Display server's error message or default message
                        });
                    }
                    throw new Error('Something went wrong. Please try again.');
                }
                return response.json();
            })
            .then((data) => {
                // Handle success (e.g., navigate to another page, show a success message, etc.)
                console.log('User created successfully:', data);
                this.setState({ errorMessage: '' }); // Clear any previous error messages
            })
            .catch((error) => {
                this.setState({ errorMessage: error.message });
                console.error('Error creating user:', error);
            });
    };

    render() {
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
                        Sign Up
                    </Typography>
                </Grid>

                {this.state.errorMessage && (
                    <Grid item xs={12} sm={8} md={6} lg={10} style={{ marginBottom: '20px' }}>
                        <Typography color="error" variant="body1">
                            {this.state.errorMessage}
                        </Typography>
                    </Grid>
                )}

                <Grid item xs={12} sm={8} md={6} lg={10}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        name="name"
                        value={this.state.name}
                        onChange={this.handleInputChange}
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
                        label="Email"
                        variant="outlined"
                        fullWidth
                        name="email"
                        value={this.state.email}
                        onChange={this.handleInputChange}
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
                        value={this.state.password}
                        onChange={this.handleInputChange}
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
                        onClick={this.handleSignUpButtonPressed}
                        style={{ padding: '15px', fontSize: '1.2rem' }}
                    >
                        Sign Up
                    </Button>
                </Grid>
            </Grid>
        );
    }
}