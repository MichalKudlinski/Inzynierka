import { Button, Card, CardContent, Typography } from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      rentals: [],
      reservations: [],
      stroje: [],
      elementStroje: [],
      errorMessage: "",
      allOwnedStroje: [],
      allOwnedElementStroje: [],
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

    fetch("/api/user/me", { headers })
      .then((res) => res.json())
      .then((user) => {
        if (!user || !user.id) {
          this.setState({ errorMessage: "User data is incomplete." });
          return;
        }
        this.setState({ user });

        if (user.is_renter) {
          this.fetchRenterData(headers);
        } else {
          this.fetchNonRenterData(headers, user.id);
        }
      })
      .catch(() => {
        this.setState({ errorMessage: "Błąd pobierania użytkownika." });
      });
  }

  async fetchRenterData(headers) {
    try {
      const [strojeRes, elementStrojeRes] = await Promise.all([
        fetch("/api/stroje/stroj/list", { headers }),
        fetch("/api/stroje/element/list", { headers }),
      ]);

      const [stroje, elementStroje] = await Promise.all([
        strojeRes.json(),
        elementStrojeRes.json(),
      ]);

      this.setState({ stroje, elementStroje });

      const wypozyczeniaRes = await fetch("/api/wypozczenia/wypozyczenie/list", { headers });
      const allWypozyczenia = await wypozyczeniaRes.json();

      const filtered = allWypozyczenia.filter((wypozyczenie) => {
        const strojObj = stroje.find((s) => s.id === wypozyczenie.stroj);
        const elementStrojObj = elementStroje.find((e) => e.id === wypozyczenie.element_stroju);
        return (strojObj?.user === this.state.user.id || elementStrojObj?.user === this.state.user.id);
      });

      const wypozyczenia = filtered.reduce(
        (acc, wypozyczenie) => {
          if (wypozyczenie.rezerwacja) acc.reservations.push(wypozyczenie);
          else acc.rentals.push(wypozyczenie);
          return acc;
        },
        { rentals: [], reservations: [] }
      );

      this.setState({
        rentals: wypozyczenia.rentals,
        reservations: wypozyczenia.reservations,
        allOwnedStroje: stroje.filter((s) => s.user === this.state.user.id),
        allOwnedElementStroje: elementStroje.filter((e) => e.user === this.state.user.id),
      });
    } catch {
      this.setState({ errorMessage: "Błąd pobierania danych wynajmującego." });
    }
  }

  async fetchNonRenterData(headers, userId) {
    try {
      const [strojeRes, elementStrojeRes] = await Promise.all([
        fetch("/api/stroje/stroj/list", { headers }),
        fetch("/api/stroje/element/list", { headers }),
      ]);

      const [stroje, elementStroje] = await Promise.all([
        strojeRes.json(),
        elementStrojeRes.json(),
      ]);

      const wypozyczeniaRes = await fetch("/api/wypozczenia/wypozyczenie/list", { headers });
      const wypozyczenia = await wypozyczeniaRes.json();

      const filteredWypozyczenia = wypozyczenia.filter((wypozyczenie) => {
        const isDirectUser = wypozyczenie.user === userId;

        const strojUser = typeof wypozyczenie.stroj === "object"
          ? wypozyczenie.stroj?.user
          : stroje.find((s) => s.id === wypozyczenie.stroj)?.user;

        const elementStrojUser = typeof wypozyczenie.element_stroju === "object"
          ? wypozyczenie.element_stroju?.user
          : elementStroje.find((e) => e.id === wypozyczenie.element_stroju)?.user;

        return isDirectUser || strojUser === userId || elementStrojUser === userId;
      });

      const splitWypozyczenia = filteredWypozyczenia.reduce(
        (acc, wypozyczenie) => {
          if (wypozyczenie.rezerwacja) acc.reservations.push(wypozyczenie);
          else acc.rentals.push(wypozyczenie);
          return acc;
        },
        { rentals: [], reservations: [] }
      );

      this.setState({
        stroje,
        elementStroje,
        rentals: splitWypozyczenia.rentals,
        reservations: splitWypozyczenia.reservations,
      });
    } catch {
      this.setState({ errorMessage: "Błąd pobierania danych osoby wynajmującej." });
    }
  }

  handleLogout = () => {
    localStorage.removeItem("token");
    this.props.navigate("/");
  };

  renderList(title, items, stroje, elementStroje) {
    const formatDate = (dateString) => {
      if (!dateString) return "brak";
      const date = new Date(dateString);
      return date.toLocaleDateString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return items.length === 0 ? (
      <Typography variant="body1" style={{ textAlign: "center" }}>
        Brak {title.toLowerCase()}
      </Typography>
    ) : (
      items.map((item) => {
        const name = (() => {
          if (item.stroj) {
            return typeof item.stroj === "object"
              ? item.stroj.name
              : stroje.find((s) => s.id === item.stroj)?.name || "Strój nieznany";
          }
          if (item.element_stroju) {
            return typeof item.element_stroju === "object"
              ? item.element_stroju.name
              : elementStroje.find((e) => e.id === item.element_stroju)?.name || "Element stroju nieznany";
          }
          return "Nieznany przedmiot";
        })();

        return (
          <Card key={item.id} style={{ marginBottom: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <CardContent>
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2">Wypożyczenie: {formatDate(item.wypozyczono)}</Typography>
              <Typography variant="body2">Zwrot: {formatDate(item.zwrot)}</Typography>
            </CardContent>
          </Card>
        );
      })
    );
  }

  renderOwnedItems(title, items) {
    return items.length === 0 ? (
      <Typography variant="body1" style={{ textAlign: "center" }}>
        Brak {title.toLowerCase()}
      </Typography>
    ) : (
      items.map((item) => (
        <Card key={item.id} style={{ marginBottom: "15px", backgroundColor: "#e6ffe6", borderRadius: "8px" }}>
          <CardContent>
            <Typography variant="h6">{item.name}</Typography>
          </CardContent>
        </Card>
      ))
    );
  }

  render() {
    const { user, rentals, reservations, stroje, elementStroje, errorMessage } = this.state;
    const { navigate } = this.props;

    return (
      <div style={{ height: "100vh", overflowY: "auto", padding: "10px", backgroundColor: "#ffebcc" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "#a52a2a",
          borderRadius: "12px",
          color: "#fff",
          border: "3px solid #d4a373",
        }}>
          <Typography variant="h4">Witaj w HeritageWear Polska!!!</Typography>
        </div>

        {/* User Info */}
        <div style={{
          border: "3px solid #d4a373",
          borderRadius: "12px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          padding: "20px",
          textAlign: "center",
          marginTop: "20px",
        }}>
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

        {/* Main Lists */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
          <div style={{ flex: "1 1 48%", border: "3px solid #d4a373", borderRadius: "12px", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#fff", padding: "20px" }}>
            <Typography variant="h5" style={{ textAlign: "center", marginBottom: "10px" }}>
              {user?.is_renter ? "Wypożyczenia Twoich przedmiotów" : "Twoje wypożyczenia"}
            </Typography>
            {this.renderList("Wypożyczenia", rentals, stroje, elementStroje)}
          </div>

          <div style={{ flex: "1 1 48%", border: "3px solid #d4a373", borderRadius: "12px", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#fff", padding: "20px" }}>
            <Typography variant="h5" style={{ textAlign: "center", marginBottom: "10px" }}>
              {user?.is_renter ? "Rezerwacje Twoich przedmiotów" : "Twoje rezerwacje"}
            </Typography>
            {this.renderList("Rezerwacje", reservations, stroje, elementStroje)}
          </div>
        </div>

        {/* Renter-only: Owned Items */}
        {user?.is_renter && (
          <div style={{ marginTop: "30px" }}>
            <Typography variant="h5" style={{ textAlign: "center" }}>Twoje stroje</Typography>
            {this.renderOwnedItems("stroje", this.state.allOwnedStroje)}

            <Typography variant="h5" style={{ textAlign: "center", marginTop: "20px" }}>Twoje elementy stroju</Typography>
            {this.renderOwnedItems("elementy stroju", this.state.allOwnedElementStroje)}
          </div>
        )}

        {/* Non-renter: Button */}
        {!user?.is_renter && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#337ab7",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "12px 20px",
              }}
              onClick={() => navigate("/reservations")}
            >
              Przeglądaj dostępne stroje
            </Button>
          </div>
        )}
      </div>
    );
  }
}

const MainPageWithNavigation = () => {
  const navigate = useNavigate();
  return <MainPage navigate={navigate} />;
};

export default MainPageWithNavigation;
