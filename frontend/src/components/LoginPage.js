import { Button, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
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
        setCsrfToken(getCookie('csrftoken'));
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'name') setName(value);
        else if (name === 'password') setPassword(value);
    };

    const handleLoginButtonPressed = () => {
        if (!csrfToken) {
            setErrorMessage("CSRF token not found. Please refresh the page.");
            return;
        }

        fetch('/api/user/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ name, password }),
        })
            .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status !== 200) throw new Error(body.error || 'Invalid login credentials');
                localStorage.setItem('token', body.token);
                navigate('/main');
            })
            .catch((error) => setErrorMessage(error.message));
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateAreas: `
                    'image-left form image-right'
                    'image-left form image-right'
                `,
                gridTemplateColumns: "1fr 2fr 1fr",
                height: "100vh",
                gap: "20px",
                padding: "10px",
                backgroundColor: "#ffebcc",
                backgroundImage: "",
                backgroundSize: "cover",
                fontFamily: "'Lobster', cursive",
            }}
        >
            <div style={{ gridArea: "image-left", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="" alt="Łowiczanka" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>

            <div style={{ gridArea: "form", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.8)", padding: "30px", borderRadius: "15px", boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }}>
                <Typography component="h4" variant="h4" style={{ marginBottom: "30px", color: "#d62828" }}>
                    Logowanie
                </Typography>
                {errorMessage && (
                    <Typography color="error" variant="body1" style={{ marginBottom: "20px" }}>
                        {errorMessage}
                    </Typography>
                )}
                <TextField
                    label="Login"
                    variant="outlined"
                    fullWidth
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    style={{ marginBottom: "20px", backgroundColor: "white", borderRadius: "5px" }}
                />
                <TextField
                    label="Hasło"
                    variant="outlined"
                    fullWidth
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    style={{ marginBottom: "30px", backgroundColor: "white", borderRadius: "5px" }}
                />
                <Button variant="contained" style={{ backgroundColor: "#d62828", color: "white", fontSize: "1.2rem", padding: "15px", borderRadius: "10px" }} fullWidth onClick={handleLoginButtonPressed}>
                    Zaloguj się
                </Button>
            </div>

            <div style={{ gridArea: "image-right", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="" alt="Krakowiak" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>
        </div>
    );
};

export default LoginPage;
