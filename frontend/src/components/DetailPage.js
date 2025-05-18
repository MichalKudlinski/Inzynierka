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

  useEffect(() => {
    if (!id || !type) {
      setErrorMessage("Missing URL parameters.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user/me", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
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
          setErrorMessage("Błąd pobierania użytkownika.");
          setLoading(false);
        });
    }

    const endpoint =
      type === "stroj"
        ? `/api/stroje/stroj${id}/detail`
        : `/api/stroje/element${id}/detail`;

    fetch(endpoint)
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

    fetch("/api/wypozyczenia/list", {
      headers: { Authorization: `Token ${token}` },
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
    setDialogMessage(
      `Please select the return date for the ${data.name} reservation.`
    );
    setShowDialog(true);
  };

  const handleRental = () => {
    setDialogType("rental");
    setDialogMessage(
      `Please select the return date for the ${data.name} rental.`
    );
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!wypozyczonoDate || !rentalDate) {
      alert("Proszę wybrać obie daty.");
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

    const isElement = type !== "stroj";
    const itemId = data.id;

    const hasConflict = reservations.some((rental) => {
      const match = isElement
        ? rental.element_stroju === itemId
        : rental.stroj === itemId;
      if (!match) return false;
      const start = new Date(rental.wypozyczono);
      const end = new Date(rental.zwrot);
      return wypozyczonoDate < end && rentalDate > start;
    });

    if (hasConflict) {
      alert("Wybrane daty kolidują z istniejącą rezerwacją.");
      return;
    }

    const payload = {
      rezerwacja: dialogType === "reserve",
      wypozyczono: wypozyczonoDate.toISOString(),
      zwrot: rentalDate.toISOString(),
      [isElement ? "element_stroju" : "stroj"]: itemId,
    };

    try {
      const res = await fetch("/api/wypozyczenia/create/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Błąd podczas zapisu.");

      const result = await res.json();
      alert(
        `${
          dialogType === "reserve" ? "Rezerwacja" : "Wypożyczenie"
        } utworzono! ID: ${result.id}`
      );
      setConfirmationMessage(
        `${
          dialogType === "reserve" ? "Rezerwacja" : "Wypożyczenie"
        } zakończona pomyślnie.`
      );
      setShowDialog(false);
      setWypozyczonoDate(null);
      setRentalDate(null);
    } catch (error) {
      alert("Nie udało się wykonać akcji: " + error.message);
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
          HeritageWear Polska
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
                  Szczegóły {type === "stroj" ? "stroju" : "elementu"}
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
                    alt="Zdjęcie"
                    style={{
                      width: "100%",
                      maxHeight: 500,
                      objectFit: "cover",
                      marginTop: 30,
                      borderRadius: "12px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    }}
                  />
                )}

                {!isRenter && (
                  <div style={{ marginTop: 30 }}>
                    <Button
                      onClick={handleRental}
                      variant="contained"
                      style={{
                        marginRight: 15,
                        backgroundColor: "#a52a2a", // Czerwony jak w ReservationPage
                        color: "#fff",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#872222")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#a52a2a")
                      }
                    >
                      Wypożycz
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleReservation}
                      style={{
                        backgroundColor: "#337ab7", // Niebieski jak w ReservationPage
                        color: "#fff",
                        marginLeft: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#23527c")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#337ab7")
                      }
                    >
                      Rezerwuj
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => navigate(-1)}
                  variant="outlined"
                  style={{ marginTop: 30 }}
                >
                  ← Powrót
                </Button>
                {confirmationMessage && (
                  <Typography color="primary" style={{ marginTop: 20 }}>
                    {confirmationMessage}
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          borderTop: "3px solid #d4a373",
          backgroundColor: "#5e554a",
          color: "#fff",
          textAlign: "center",
          padding: "15px",
          fontSize: "0.9rem",
        }}
      >
        Kontakt: kontakt@heritagewear.pl | Tel: +48 123 456 789
      </div>

      {/* DIALOG */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Potwierdzenie</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
          <TextField
            label="Data wypożyczenia"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={
              wypozyczonoDate
                ? new Date(
                    wypozyczonoDate.getTime() -
                      wypozyczonoDate.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onChange={(e) => setWypozyczonoDate(new Date(e.target.value))}
            style={{ marginTop: 16 }}
          />
          <TextField
            label="Data zwrotu"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={
              rentalDate
                ? new Date(
                    rentalDate.getTime() -
                      rentalDate.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onChange={(e) => setRentalDate(new Date(e.target.value))}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">
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
