import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [email, setEmail] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

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
        else if (name === 'email') setEmail(value);
    };

    const handleForgotPassword = () => {
        if (!email) {
            setDialogMessage("Proszę podać email.");
            return;
        }

        fetch('/api/user/reset-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ email }),
        })
            .then((response) => response.json().then((data) => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status !== 200) throw new Error(body.error || 'Reset failed');
                setDialogMessage("Nowe hasło zostało wysłane na Twój email.");
            })
            .catch((error) => {
                setDialogMessage(error.message || "Wystąpił błąd.");
            });
    };

    const handleLoginButtonPressed = (event) => {
        event.preventDefault();

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

    const handleDialogClose = () => {
        setOpenDialog(false);
        setEmail('');
        setDialogMessage('');
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
                fontFamily: "'Lobster', cursive",
            }}
        >
            <div style={{ gridArea: "image-left", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/media\uploads\images\Krakowiak.webp" alt="Krakowiak" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>

            <div
                style={{
                    gridArea: "form",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "30px",
                    borderRadius: "15px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                }}
            >
                <Typography component="h4" variant="h4" style={{ marginBottom: "30px", color: "#d62828" }}>
                    Logowanie
                </Typography>

                {errorMessage && (
                    <Typography color="error" variant="body1" style={{ marginBottom: "20px" }}>
                        {errorMessage}
                    </Typography>
                )}

                <form onSubmit={handleLoginButtonPressed} style={{ width: '100%' }}>
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
                    <Button
                        type="submit"
                        variant="contained"
                        style={{
                            backgroundColor: "#d62828",
                            color: "white",
                            fontSize: "1.2rem",
                            padding: "15px",
                            borderRadius: "10px",
                        }}
                        fullWidth
                    >
                        Zaloguj się
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        style={{
                        fontSize: "1rem",
                        textTransform: "none",
                        marginTop: "10px",
                        padding: "10px 20px",
                        borderRadius: "25px", 
                        transition: "all 0.3s ease", 
                        border: "2px solid #1976d2", 
                        color: "white",
                        backgroundColor: "#1976d2"
                    }}
                    fullWidth
                    onClick={() => setOpenDialog(true)}

                >
                    Zapomniałem hasła
                      </Button>
                </form>
            </div>

            <div style={{ gridArea: "image-right", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/media\uploads\images\Krakowianka.webp" alt="Krakowianka" style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>

            {/* Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Resetowanie hasła</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={handleInputChange}
                        style={{ marginBottom: "10px" }}
                    />
                    {dialogMessage && (
                        <Typography variant="body2" style={{ color: dialogMessage.includes('wysłane') ? 'green' : 'red' }}>
                            {dialogMessage}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
  <Button
    onClick={handleDialogClose}
    variant="contained"
    style={{
      backgroundColor: "#d9534f",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "8px",
      textTransform: "none",
      padding: "8px 16px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#c9302c")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#d9534f")}
  >
    Zamknij
  </Button>

  <Button
    onClick={handleForgotPassword}
    variant="contained"
    style={{
      backgroundColor: "#337ab7",
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "8px",
      textTransform: "none",
      padding: "8px 16px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.target.style.backgroundColor = "#23527c")}
    onMouseOut={(e) => (e.target.style.backgroundColor = "#337ab7")}
  >
    Wyślij nowe hasło
  </Button>
</DialogActions>
            </Dialog>
        </div>
    );
};

export default LoginPage;
