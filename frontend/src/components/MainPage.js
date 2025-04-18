import { Button, Typography, Card, CardContent } from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      reservations: [],
      errorMessage: "",
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");

    if (token) {
      // Fetch user data
      fetch("/api/user/me", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user data");
          return response.json();
        })
        .then((data) => this.setState({ user: data }))
        .catch((error) => this.setState({ errorMessage: error.message }));

      // Fetch reservations
      fetch("/api/user/reservations", {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch reservations");
          return response.json();
        })
        .then((data) => this.setState({ reservations: data }))
        .catch((error) => console.error("Error fetching reservations:", error));
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
    const { user, reservations, errorMessage } = this.state;
    const { navigate } = this.props;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `
            'header header'
            'info reservations'
            'footer footer'
          `,
          gridTemplateColumns: "2fr 1fr",
          gridTemplateRows: "auto 1fr auto",
          height: "100vh",
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
            gridArea: "header",
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
          <Typography variant="h4">Witaj w HeritageWear Polska</Typography>
        </div>

        {/* User Info */}
        <div
          style={{
            gridArea: "info",
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
            <Typography variant="body1">Ładowanie danych użytkownika...</Typography>
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
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b52b27")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#d9534f")}
            onClick={this.handleLogout}
          >
            Wyloguj się
          </Button>
        </div>

        {/* Reservations Container */}
        <div
          style={{
            gridArea: "reservations",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            border: "3px solid #d4a373",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#ffffff",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Twoje rezerwacje
          </Typography>

          {reservations.length === 0 ? (
            <Typography variant="body1">Brak rezerwacji</Typography>
          ) : (
            reservations.map((reservation) => (
              <Card
                key={reservation.id}
                style={{
                  width: "90%",
                  marginBottom: "10px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" style={{ fontWeight: "bold", color: "#333" }}>
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

          {/* Button to navigate to Reservation Page */}
          <Button
            variant="contained"
            style={{
              backgroundColor: "#337ab7",
              color: "#ffffff",
              marginTop: "20px",
              fontWeight: "bold",
              borderRadius: "12px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              padding: "12px 24px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#23527c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#337ab7")}
            onClick={() => navigate("/reservations")}
          >
            Zobacz wszystkie rezerwacje
          </Button>
        </div>

        {/* Footer */}
        <div
          style={{
            gridArea: "footer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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