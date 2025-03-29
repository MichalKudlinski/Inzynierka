import { Button, Typography, Card, CardContent } from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      reservations: [],
      rentals: [],
      errorMessage: "",
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("/api/user/me", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user data");
          return res.json();
        })
        .then((data) => this.setState({ user: data }))
        .catch((err) => this.setState({ errorMessage: err.message }));

      fetch("/api/user/reservations", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch reservations");
          return res.json();
        })
        .then((data) => this.setState({ reservations: data }))
        .catch((err) => console.error("Error fetching reservations:", err));

      fetch("/api/user/rentals", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch rentals");
          return res.json();
        })
        .then((data) => this.setState({ rentals: data }))
        .catch((err) => console.error("Error fetching rentals:", err));
    } else {
      this.setState({ errorMessage: "No authentication token found" });
    }
  }

  handleLogout = () => {
    localStorage.removeItem("token");
    const { navigate } = this.props;
    navigate("/");
  };

  render() {
    const { user, reservations, rentals, errorMessage } = this.state;
    const { navigate } = this.props;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          gap: "20px",
          padding: "10px",
          backgroundColor: "#ffebcc",
          backgroundImage: "url('XXXXXXXXXXXX')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#a52a2a",
            border: "3px solid #d4a373",
            borderRadius: "12px",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          <Typography variant="h4">Witaj w HeritageWear Polska!!!</Typography>
        </div>

        {/* Środkowe okna :  informacji (użytnkownik | wypożyczenia | rezerwacje*/}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "20px",
            flex: "1",
          }}
        >
          {/* Informacje*/}
          <div
            style={{
              flex: "0 0 20%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #d4a373",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
            }}
          >
            {errorMessage ? (
              <Typography color="error" variant="h6">
                {errorMessage}
              </Typography>
            ) : user ? (
              <>
                <Typography variant="h5" style={{ fontWeight: "bold" }}>
                  Witaj, {user.name}!
                </Typography>
                <Typography variant="body1">Email: {user.email}</Typography>
              </>
            ) : (
              <Typography variant="body1">
                Ładowanie danych użytkownika...
              </Typography>
            )}

            <Button
              variant="contained"
              style={{
                backgroundColor: "#d9534f",
                color: "#ffffff",
                marginTop: "20px",
                fontWeight: "bold",
                borderRadius: "12px",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                padding: "12px 24px",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#b52b27")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#d9534f")}
              onClick={this.handleLogout}
            >
              Wyloguj się
            </Button>
          </div>

          {/* Wypożyczenia */}
          <div
            style={{
              flex: "0 1 38%",
              border: "3px solid #d4a373",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h5"
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Twoje wypożyczenia
            </Typography>

            {rentals.length === 0 ? (
              <Typography variant="body1" style={{ textAlign: "center" }}>
                Brak wypożyczeń
              </Typography>
            ) : (
              rentals.map((rental) => (
                <Card
                  key={rental.id}
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      style={{ fontWeight: "bold", color: "#333" }}
                    >
                      {rental.title}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Data: {rental.date}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Status: {rental.status}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Rezerwacje */}
          <div
            style={{
              flex: "0 1 38%",
              border: "3px solid #d4a373",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h5"
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Twoje rezerwacje
            </Typography>

            {reservations.length === 0 ? (
              <Typography variant="body1" style={{ textAlign: "center" }}>
                Brak rezerwacji
              </Typography>
            ) : (
              reservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      style={{ fontWeight: "bold", color: "#333" }}
                    >
                      {reservation.title}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Data: {reservation.date}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Status: {reservation.status}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "10px",
          }}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#337ab7",
              color: "#ffffff",
              fontWeight: "bold",
              borderRadius: "12px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              padding: "12px 24px",
              marginTop: "-10px",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#23527c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#337ab7")}
            onClick={() => navigate("/reservations")}
          >
            Zobacz dostępne stroje
          </Button>
        </div>

        {/* Stoopka */}
        <div
          style={{
            border: "3px solid #d4a373",
            borderRadius: "12px",
            padding: "15px",
            textAlign: "center",
            fontSize: "1rem",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#ffffff",
          }}
        >
          <p>Kontakt: kontakt@heritagewear.pl | Tel: +48 123 456 789</p>
        </div>
      </div>
    );
  }
}

export const MainPageWithNavigate = (props) => {
  const navigate = useNavigate();
  return <MainPage {...props} navigate={navigate} />;
};
