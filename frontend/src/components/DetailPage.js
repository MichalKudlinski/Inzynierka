import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [wypozyczonoDate, setWypozyczonoDate] = useState(null);
  const [rentalDate, setRentalDate] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isRenter, setIsRenter] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null);

  // Map Polish URL types to English for API endpoints and display
  const typeMapping = {
    stroj: "costume",
    element: "element",
  };
  const englishType = typeMapping[type] || type;

  useEffect(() => {
    if (!id || !type) {
      setErrorMessage("Missing URL parameters.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const authHeaders = {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };

    if (token) {
      fetch("/api/user/me", {
        headers: authHeaders,
      })
        .then((res) => res.json())
        .then((userData) => {
          if (!userData?.id) {
            setErrorMessage("User data is incomplete.");
            setLoading(false);
            return;
          }
          setUser(userData);
          setIsRenter(userData.is_renter);
        })
        .catch(() => {
          setErrorMessage("Error fetching user data.");
          setLoading(false);
        });
    }

    const endpoint =
      englishType === "costume"
        ? `/api/costumes/costume${id}/detail`
        : `/api/costumes/element${id}/detail`;

    fetch(endpoint, {
      headers: authHeaders,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch details.");
        return res.json();
      })
      .then((itemData) => {
        setData(itemData);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setLoading(false);
      });

    fetch("/api/rentals/list", {
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then(setReservations)
      .catch(console.error);
  }, [id, type]);

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

  const handleReservation = () => {
    setDialogType("reserve");
    setDialogMessage(`Wybierz przedział rezerwacji ${data.name}.`);
    setShowDialog(true);
  };

  const handleRental = () => {
    setDialogType("rental");
    setDialogMessage(`Wybierz date wypożyczenia i zwrotu ${data.name}.`);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!wypozyczonoDate || !rentalDate) {
      alert("Proszę wybrać obie daty: wypożyczenia i zwrotu.");
      return;
    }

    const now = new Date();
    if (wypozyczonoDate < now || rentalDate < now) {
      alert("Daty muszą być w przyszłości.");
      return;
    }

    if (wypozyczonoDate >= rentalDate) {
      alert("Data zwrotu musi być po dacie wypożyczenia.");
      return;
    }

    const isElement = englishType !== "costume";
    const itemId = data.id;

    const hasConflict = reservations.some((rental) => {
      const match = isElement
        ? rental.element === itemId
        : rental.costume === itemId;
      if (!match) return false;
      const start = new Date(rental.rented);
      const end = new Date(rental.return_date);
      return wypozyczonoDate < end && rentalDate > start;
    });

    if (hasConflict) {
      alert(
        "Wybrane daty kolidują z istniejącym wypożyczeniem lub rezerwacją."
      );
      return;
    }

    const payload = {
      reservation: dialogType === "reserve",
      rented: wypozyczonoDate.toISOString(),
      return_date: rentalDate.toISOString(),
      [isElement ? "element" : "strój"]: itemId,
    };

    try {
      const res = await fetch("/api/rentals/create/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error saving data.");

      const result = await res.json();
      alert(
        `${dialogType === "reserve" ? "Reservation" : "Rental"} created! ID: ${
          result.id
        }`
      );
      setConfirmationMessage(
        `${
          dialogType === "reserve" ? "Reservation" : "Rental"
        } completed successfully.`
      );
      setShowDialog(false);
      setWypozyczonoDate(null);
      setRentalDate(null);
    } catch (error) {
      alert("Action failed: " + error.message);
      setShowDialog(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffebcc",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#a52a2a",
          borderRadius: "12px",
          color: "#fff",
          border: "3px solid #d4a373",
          margin: "10px",
        }}
      >
        <Typography variant="h4" style={{ flexGrow: 1, textAlign: "center" }}>
          HeritageWear Poland
        </Typography>
      </div>
      {/* CONTENT */}
      <div
        style={{
          flex: "1",
          display: "flex",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            padding: "30px",
            borderRadius: "12px",
            border: "3px solid #d4a373",
            width: "100%",
            maxWidth: 1000,
            marginBottom: "30px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            style={{
              padding: "40px",
              borderRadius: "20px",
              backgroundColor: "#ffebcc",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : errorMessage ? (
              <Typography color="error">{errorMessage}</Typography>
            ) : (
              <>
                <Typography variant="h4" gutterBottom>
                  Szczegóły {englishType === "costume" ? "stroju" : "elementu"}
                </Typography>

                <Typography variant="h5" gutterBottom>
                  <strong>Nazwa:</strong> {data.name}
                </Typography>
                <Typography>
                  <strong>Płeć:</strong> {data.gender}
                </Typography>
                <Typography>
                  <strong>Rozmiar:</strong> {data.size}
                </Typography>
                <Typography>
                  <strong>Miasto:</strong> {data.city}
                </Typography>
                <Typography style={{ marginTop: 20 }}>
                  <strong>Opis:</strong>
                  <br />
                  {data.description}
                </Typography>

                {data.name && (
                  <img
                    src={`/media/uploads/images/${data.name}.jpg`}
                    alt="Photo"
                    style={{
                      width: 400,
                      height: 400,
                      objectFit: "cover",
                      borderRadius: "12px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    }}
                  />
                )}

                <div style={{ marginTop: 30 }}>
                  {!isRenter && (
                    <>
                      <Button
                        onClick={handleRental}
                        variant="contained"
                        style={{
                          marginTop: "10px",
                          backgroundColor: "#a52a2a",
                          color: "#fff",
                        }}
                      >
                        Wypożycz
                      </Button>
                      <Button
                        onClick={handleReservation}
                        variant="contained"
                        style={{
                          marginTop: "10px",
                          backgroundColor: "#337ab7",
                          color: "#fff",
                        }}
                      >
                        Rezerwuj
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outlined"
                    style={{
                      marginTop: "10px",
                      marginLeft: "20px",
                      backgroundColor: "#d9534f",
                      color: "#fff",
                    }}
                  >
                    Wróć
                  </Button>
                </div>
              </>
            )}
          </Paper>
        </div>
      </div>{" "}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>
          Przedział dni{" "}
          {dialogType === "reserve" ? "rezerwacji" : "wypożyczenia"}
        </DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
          <TextField
            label="Data rozpoczęcia"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={
              wypozyczonoDate ? wypozyczonoDate.toISOString().slice(0, 16) : ""
            }
            onChange={(e) => setWypozyczonoDate(new Date(e.target.value))}
            style={{ marginTop: 20 }}
            fullWidth
          />
          <TextField
            label="Data zwrotu"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={rentalDate ? rentalDate.toISOString().slice(0, 16) : ""}
            onChange={(e) => setRentalDate(new Date(e.target.value))}
            style={{ marginTop: 20 }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            Anuluj
          </Button>
          <Button onClick={confirmAction} color="primary">
            Potwierdź
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DetailPage;
