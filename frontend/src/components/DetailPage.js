import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetailPage = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();  // Hook for navigation
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogType, setDialogType] = useState("");
    const [rentalDate, setRentalDate] = useState(null);
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [isRenter, setIsRenter] = useState(false);  // State to track if the user is a renter

    useEffect(() => {
        console.log("Type:", type);
        console.log("ID:", id);

        if (!id || !type) {
            setErrorMessage("Missing URL parameters.");
            setLoading(false);
            return;
        }

        // Fetch user data from the API
        const token = localStorage.getItem("token");
        if (token) {
            const headers = {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            };

            console.log("Fetching user data...");
            fetch("/api/user/me", { headers })
                .then((res) => res.json())
                .then((user) => {
                    console.log("Fetched user:", user);

                    if (!user || !user.id) {
                        setErrorMessage("User data is incomplete.");
                        setLoading(false);
                        return;
                    }

                    setIsRenter(user.is_renter);  // Set renter status based on the user data
                    console.log("User is_renter:", user.is_renter);
                })
                .catch(() => {
                    setErrorMessage("Błąd pobierania użytkownika.");
                    setLoading(false);
                });
        } else {
            console.log("No token found in localStorage.");
        }

        const endpoint =
            type === "stroj"
                ? `/api/stroje/stroj${id}/detail`
                : `/api/stroje/element${id}/detail`;

        console.log("Fetching item data from:", endpoint);

        fetch(endpoint)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch details.");
                return res.json();
            })
            .then((json) => {
                console.log("Fetched item data:", json);
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setErrorMessage(err.message);
                setLoading(false);
            });
    }, [id, type]);

    const handleReservation = () => {
        setDialogMessage(`Please select the return date for the ${data.name} reservation.`);
        setDialogType("reserve");
        setShowDialog(true);
    };

    const handleRental = () => {
        setDialogMessage(`Please select the return date for the ${data.name} rental.`);
        setDialogType("rental");
        setShowDialog(true);
    };

    const handleDateChange = (date) => {
        setRentalDate(date);
    };

    const confirmAction = async () => {
        if (!rentalDate) {
            alert("Please select a return date.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("User token not found.");
            return;
        }

        const payload = {
            [dialogType === "reserve" ? "rezerwacja" : "wypozyczenie"]: true,
            zwrot: rentalDate.toISOString(),
            [type === "stroj" ? "stroj" : "element_stroju"]: data.id,
        };

        try {
            const res = await fetch("/api/wypozyczenia/create/", {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to perform action.");

            const responseData = await res.json();


            setConfirmationMessage(
                `Dziękujemy bardzo za ${dialogType === "reserve" ? "rezerwację" : "wypożyczenie"}! Element: ${data.name} ${type === "stroj" ? "(Stroj)" : "(Element Stroju)"}`
            );

            // Redirect back to the previous page after the message
            setTimeout(() => {
                navigate(-1);  // Navigate back to the previous page
            }, 3000);  // Delay the navigation for 3 seconds to show the confirmation message

            setShowDialog(false);
        } catch (error) {
            alert("Failed to execute action: " + error.message);
            setShowDialog(false);
        }
    };

    const cancelAction = () => {
        setShowDialog(false);
    };

    const getCSRFToken = () => {
        const name = "csrftoken";
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + "=")) {
                return trimmed.substring(name.length + 1);
            }
        }
        return null;
    };

    useEffect(() => {
        console.log("isRenter value:", isRenter);
    }, [isRenter]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                minHeight: "100vh",
                backgroundColor: "#ffebcc",
                fontFamily: "'Lobster', cursive",
                padding: "40px 20px",
            }}
        >
            <Paper
                style={{
                    padding: "30px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "15px",
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                    maxWidth: "800px",
                    width: "100%",
                }}
            >
                {loading ? (
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress />
                    </div>
                ) : errorMessage ? (
                    <Typography color="error" variant="body1">
                        {errorMessage}
                    </Typography>
                ) : (
                    <>
                        <Typography variant="h4" gutterBottom style={{ color: "#d62828" }}>
                            Szczegóły {type === "stroj" ? "stroju" : "elementu stroju"}
                        </Typography>

                        {/* Name */}
                        <Typography variant="h5" gutterBottom>
                            <strong>Nazwa:</strong> {data.name}
                        </Typography>

                        {/* Gender */}
                        <Typography variant="body1" gutterBottom>
                            <strong>Płeć:</strong> {data.gender}
                        </Typography>

                        {/* Size */}
                        <Typography variant="body1" gutterBottom>
                            <strong>Rozmiar:</strong> {data.size}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>Miasto:</strong> {data.city}
                        </Typography>

                        {/* Description */}
                        <Typography
                            variant="body1"
                            gutterBottom
                            style={{
                                marginTop: "20px",
                                fontSize: "18px",
                                lineHeight: 1.6,
                                backgroundColor: "#fff7e6",
                                padding: "15px",
                                borderRadius: "10px",
                                border: "1px solid #ffd699",
                            }}
                        >
                            <strong>Opis:</strong><br />
                            {data.description}
                        </Typography>

                        {data.name && (
                            <div style={{ textAlign: "center", marginTop: "30px" }}>
                                <img
                                    src={`/media/uploads/images/${data.name}.jpg`}
                                    alt="Zdjęcie"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "400px",
                                        borderRadius: "10px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </div>
                        )}

                        {/* Buttons */}
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            {/* Log isRenter value */}
                            {console.log("Rendering buttons. isRenter:", isRenter)}

                            {/* Show buttons only if the user is not a renter */}
                            {!isRenter && (
                                <>
                                    <Button
                                        onClick={handleRental}
                                        variant="contained"
                                        style={{ backgroundColor: "#a52a2a", color: "#fff", margin: "10px" }}
                                    >
                                        Wypożycz
                                    </Button>
                                    <Button
                                        onClick={handleReservation}
                                        variant="contained"
                                        style={{ backgroundColor: "#337ab7", color: "#fff", margin: "10px" }}
                                    >
                                        Rezerwuj
                                    </Button>
                                </>
                            )}

                            <Button
                                onClick={() => navigate(-1)}
                                variant="outlined"
                                style={{ marginBottom: "20px", color: "#d62828", borderColor: "#d62828" }}
                            >
                                ← Powrót
                            </Button>
                        </div>

                        {/* Confirmation message */}
                        {confirmationMessage && (
                            <Typography variant="h6" style={{ color: "#28a745", marginTop: "20px", textAlign: "center" }}>
                                {confirmationMessage}
                            </Typography>
                        )}
                    </>
                )}
            </Paper>

            {/* Dialog for reservation or rental */}
            <Dialog open={showDialog} onClose={cancelAction}>
                <DialogTitle>Potwierdzenie</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">{dialogMessage}</Typography>
                    <TextField
                        type="datetime-local"
                        label="Wybierz datę zwrotu"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={rentalDate ? rentalDate.toISOString().slice(0, 16) : ""}
                        onChange={(e) => handleDateChange(new Date(e.target.value))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelAction} color="secondary">Anuluj</Button>
                    <Button onClick={confirmAction} color="primary">Potwierdź</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DetailPage;
