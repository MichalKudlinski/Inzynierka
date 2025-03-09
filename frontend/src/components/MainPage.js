import { Button } from '@material-ui/core';
import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';


class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            errorMessage: '', // For any errors fetching data
        };
    }

    componentDidMount() {
        // Fetch user data from /api/user/me after the component mounts
        const token = localStorage.getItem('token'); // Retrieve the token (assuming it's stored in localStorage)

        if (token) {
            fetch('/api/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`, // Add the token to the request header
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    return response.json();
                })
                .then((data) => {
                    this.setState({ user: data });
                })
                .catch((error) => {
                    this.setState({ errorMessage: error.message });
                });
        } else {
            this.setState({ errorMessage: 'No authentication token found' });
        }
    }

    handleLogout = () => {
        // Remove the token from localStorage (or sessionStorage)
        localStorage.removeItem('token');

        // Navigate to the HomePage (route `/home`)
        const { navigate } = this.props;
        navigate('/');
    };

    render() {
        const { user, errorMessage } = this.state;

        return (
            <div style={{ padding: '20px' }}>
                <h1>User authenticated - Main Page</h1>

                {errorMessage && (
                    <div style={{ color: 'red', marginBottom: '20px' }}>
                        <strong>{errorMessage}</strong>
                    </div>
                )}

                {user ? (
                    <div>
                        <h2>Welcome, {user.name}!</h2>
                        <p>Email: {user.email}</p>
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={this.handleLogout}
                    style={{ marginTop: '20px' }}
                >
                    Log Out
                </Button>
            </div>
        );
    }
}

// Wrap MainPage with useNavigate to pass navigate as a prop
export const MainPageWithNavigate = (props) => {
    const navigate = useNavigate();
    return <MainPage {...props} navigate={navigate} />;
};