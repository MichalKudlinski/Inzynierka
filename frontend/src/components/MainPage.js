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

    if (!token) {
      this.setState({ errorMessage: "Nie znaleziono tokenu użytkownika." });
      return;
    }

    const headers = {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };

    // Dane użytkownika
    fetch("/api/user/me", { headers })
      .then((res) => res.json())
      .then((user) => this.setState({ user }))
      .catch((err) =>
        this.setState({ errorMessage: "Błąd pobierania użytkownika." })
      );

    // Wypożyczenia użytkownika
    fetch("/api/wypozczenia/", { headers })
      .then((res) => res.json())
      .then((rentals) => this.setState({ rentals }))
      .catch((err) => console.error("Błąd pobierania wypożyczeń:", err));

    // Rezerwacje użytkownika
    fetch("/api/stroje/", { headers })
      .then((res) => res.json())
      .then((reservations) => this.setState({ reservations }))
      .catch((err) => console.error("Błąd pobierania rezerwacji:", err));
  }

  handleLogout = () => {
    localStorage.removeItem("token");
    this.props.navigate("/");
  };

  renderList(title, items, keyName) {
    return items.length === 0 ? (
      <Typography variant="body1" style={{ textAlign: "center" }}>
        Brak {title.toLowerCase()}
      </Typography>
    ) : (
      items.map((item) => (
        <Card
          key={item.id}
          style={{
            width: "100%",
            marginBottom: "10px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              style={{ fontWeight: "bold", color: "#333" }}
            >
              {item[keyName] || "Nazwa nieznana"}
            </Typography>
            <Typography variant="body2" style={{ color: "#555" }}>
              Data: {item.date || "brak"}
            </Typography>
            <Typography variant="body2" style={{ color: "#555" }}>
              Status: {item.status || "nieznany"}
            </Typography>
          </CardContent>
        </Card>
      ))
    );
  }

  render() {
    const { user, rentals, reservations, errorMessage } = this.state;
    const { navigate } = this.props;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          padding: "10px",
          backgroundColor: "#ffebcc",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#a52a2a",
            borderRadius: "12px",
            color: "#fff",
            border: "3px solid #d4a373",
          }}
        >
          <Typography variant="h4">Witaj w HeritageWear Polska!!!</Typography>
        </div>

        <div
          style={{ display: "flex", gap: "20px", flex: "1", marginTop: "20px" }}
        >
          {/* Info o użytkowniku */}
          <div
            style={{
              flex: "0 0 20%",
              border: "3px solid #d4a373",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "20px",
              textAlign: "center",
            }}
          >
            {errorMessage ? (
              <Typography color="error">{errorMessage}</Typography>
            ) : user ? (
              <>
                <Typography variant="h6">Witaj, {user.name}!</Typography>
                <Typography variant="body2">{user.email}</Typography>
              </>
            ) : (
              <Typography>Ładowanie...</Typography>
            )}

            <Button
              variant="contained"
              onClick={this.handleLogout}
              style={{
                backgroundColor: "#d9534f",
                color: "#fff",
                marginTop: "20px",
                borderRadius: "12px",
              }}
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
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "20px",
              overflowY: "auto",
              maxHeight: "60vh",
            }}
          >
            <Typography
              variant="h5"
              style={{ textAlign: "center", marginBottom: "10px" }}
            >
              Twoje wypożyczenia
            </Typography>
            {this.renderList("Wypożyczenia", rentals, "title")}
          </div>

          {/* Rezerwacje */}
          <div
            style={{
              flex: "0 1 38%",
              border: "3px solid #d4a373",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "20px",
              overflowY: "auto",
              maxHeight: "60vh",
            }}
          >
            <Typography
              variant="h5"
              style={{ textAlign: "center", marginBottom: "10px" }}
            >
              Twoje rezerwacje
            </Typography>
            {this.renderList("Rezerwacje", reservations, "title")}
          </div>
        </div>

        {/* Przycisk */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#337ab7",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "12px 24px",
            }}
            onClick={() => navigate("/reservations")}
          >
            Zobacz dostępne stroje
          </Button>
        </div>

        {/* Stopka */}
        <div
          style={{
            marginTop: "auto",
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
