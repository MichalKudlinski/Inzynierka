import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

function withNavigation(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}

class ReservationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      costumes: [],
      elements: [],
      reservations: [],
      error: null,
      selectedElementType: null,
      showFullCostume: true,
      showDialog: false,
      dialogMessage: "",
      dialogType: "",
      itemToProcess: null,
      isElement: false,
      rentalDate: null,
      wypozyczonoDate: null,
      selectedRentals: [],
      rentalDialogOpen: false,
      user: null,
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.setState({ error: "Nie znaleziono tokenu użytkownika." });
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
          this.setState({ error: "Błąd pobierania danych użytkownika." });
          return;
        }

        this.setState({ user });

        return Promise.all([
          fetch("/api/stroje/stroj/list", { headers }),
          fetch("/api/stroje/element/list", { headers }),
          fetch("/api/wypozyczenia/list", { headers }),
        ]);
      })
      .then(async ([costumeRes, elementRes, reservationRes]) => {
        if (!costumeRes.ok || !elementRes.ok || !reservationRes.ok) {
          throw new Error(
            "❌ Błąd pobierania strojów, elementów lub wypożyczeń"
          );
        }

        const [costumesData, elementsData, reservationsData] =
          await Promise.all([
            costumeRes.json(),
            elementRes.json(),
            reservationRes.json(),
          ]);

        const now = new Date();
        const upcomingReservations = reservationsData.filter(
          (rental) => new Date(rental.zwrot) > now
        );

        this.setState({
          costumes: costumesData,
          elements: elementsData,
          reservations: upcomingReservations,
        });
      })
      .catch((err) => {
        console.error("❗ Error loading data:", err);
        this.setState({ error: err.message });
      });
  }

  getCSRFToken = () => {
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

  handleReserve = (item, isElement) => {
    this.setState({
      showDialog: true,
      dialogMessage: `Wybierz daty wypożyczenia i zwrotu dla ${item.name}.`,
      dialogType: "reserve",
      itemToProcess: item,
      isElement,
      rentalDate: null,
      wypozyczonoDate: null,
    });
  };

  handleRental = (item, isElement) => {
    this.setState({
      showDialog: true,
      dialogMessage: `Wybierz daty wypożyczenia i zwrotu dla ${item.name}.`,
      dialogType: "rental",
      itemToProcess: item,
      isElement,
      rentalDate: null,
      wypozyczonoDate: null,
    });
  };

  handleShowRentals = (item, isElement) => {
    const relatedRentals = this.state.reservations.filter((rental) =>
      isElement ? rental.element_stroju === item.id : rental.stroj === item.id
    );
    this.setState({ selectedRentals: relatedRentals, rentalDialogOpen: true });
  };

  handleCloseRentalDialog = () => {
    this.setState({ rentalDialogOpen: false });
  };

  confirmAction = async () => {
    const {
      dialogType,
      itemToProcess,
      isElement,
      rentalDate,
      wypozyczonoDate,
      reservations,
    } = this.state;

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

    const conflicts = reservations.filter((rental) => {
      const isSameItem = isElement
        ? rental.element_stroju === itemToProcess.id
        : rental.stroj === itemToProcess.id;

      if (!isSameItem) return false;

      const start = new Date(rental.wypozyczono);
      const end = new Date(rental.zwrot);

      return wypozyczonoDate < end && rentalDate > start;
    });

    if (conflicts.length > 0) {
      alert(
        "Wybrane daty kolidują z istniejącym wypożyczeniem lub rezerwacją."
      );
      return;
    }

    const token = localStorage.getItem("token");
    const { user } = this.state;

    if (!user?.id || !token) {
      alert("Brak danych użytkownika.");
      return;
    }

    const payload = {
      rezerwacja: dialogType === "reserve",
      wypozyczono: wypozyczonoDate.toISOString(),
      zwrot: rentalDate.toISOString(),
      [isElement ? "element_stroju" : "stroj"]: itemToProcess.id,
    };

    try {
      const res = await fetch("/api/wypozyczenia/create/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Błąd podczas akcji.");

      const data = await res.json();
      alert(
        `${
          dialogType === "reserve" ? "Rezerwacja" : "Wypożyczenie"
        } utworzono! ID: ${data.id}`
      );

      const updatedReservations = await fetch("/api/wypozyczenia/list", {
        headers: { Authorization: `Token ${token}` },
      });
      const reservationsData = await updatedReservations.json();
      this.setState({ reservations: reservationsData, showDialog: false });
    } catch (error) {
      alert("Nie udało się wykonać akcji: " + error.message);
      this.setState({ showDialog: false });
    }
  };

  cancelAction = () => {
    this.setState({ showDialog: false });
  };

  handleElementTypeClick = (elementType) => {
    this.setState((prevState) => ({
      selectedElementType:
        prevState.selectedElementType === elementType ? null : elementType,
    }));
  };

  toggleCostumeView = () => {
    this.setState((prevState) => ({
      showFullCostume: !prevState.showFullCostume,
    }));
  };

  handleGoBack = () => {
    this.props.navigate(-1);
  };

  render() {
    const {
      costumes,
      elements,
      selectedElementType,
      showFullCostume,
      showDialog,
      dialogMessage,
      rentalDate,
      wypozyczonoDate,
      selectedRentals,
      rentalDialogOpen,
    } = this.state;

    const elementCategories = [
      "nakrycie_glowy",
      "koszula",
      "kamizelka",
      "akcesoria",
      "bizuteria",
      "halka",
      "sukienka",
      "buty",
      "spodnie",
    ];

    const elementsInCostume = new Set();
    costumes.forEach((costume) => {
      elementCategories.forEach((category) => {
        const id = costume[category];
        if (id != null) elementsInCostume.add(id);
      });
    });

    const filteredItems = showFullCostume
      ? costumes
      : elements.filter((item) => {
          const isInCostume = elementsInCostume.has(item.id);
          const matchesType = selectedElementType
            ? item.element_type === selectedElementType
            : true;
          return !isInCostume && matchesType;
        });

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
            padding: "20px",
            margin: "10px",
            backgroundColor: "#a52a2a",
            borderRadius: "12px",
            color: "#fff",
            border: "3px solid #d4a373",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" style={{ margin: 0 }}>
            Dostępne elementy i stroje ludowe
          </Typography>
        </div>

        <div style={{ padding: "20px", flex: "1" }}>
          <Button
            onClick={this.handleGoBack}
            variant="contained"
            style={{
              marginBottom: "20px",
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "3px solid #d4a373",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#b52b27")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#d9534f")}
          >
            Wróć
          </Button>

          <Button
            onClick={this.toggleCostumeView}
            variant="contained"
            style={{
              backgroundColor: "#337ab7",
              color: "#fff",
              marginBottom: "20px",
              border: "3px solid #d4a373",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#23527c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#337ab7")}
          >
            {showFullCostume ? "Pokaż elementy" : "Pokaż stroje"}
          </Button>

          {!showFullCostume && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              {elementCategories.map((category) => (
                <Button
                  key={category}
                  onClick={() => this.handleElementTypeClick(category)}
                  variant={
                    selectedElementType === category ? "contained" : "outlined"
                  }
                  color="primary"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              padding: "20px",
              borderRadius: "12px",
              border: "3px solid #d4a373",
              marginBottom: "30px",
            }}
          >
            {filteredItems.length === 0 ? (
              <Typography
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#a52a2a",
                }}
              >
                Brak dostępnych{" "}
                {showFullCostume ? "strojów" : "elementów stroju"} do
                wyświetlenia.
              </Typography>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  style={{
                    backgroundColor: "#ffebcc",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2">{item.description}</Typography>
                    <Button
                      fullWidth
                      style={{
                        marginTop: "10px",
                        backgroundColor: "#337ab7",
                        color: "#fff",
                      }}
                      onClick={() => this.handleReserve(item, !showFullCostume)}
                    >
                      Rezerwuj
                    </Button>
                    <Button
                      fullWidth
                      style={{
                        marginTop: "10px",
                        backgroundColor: "#a52a2a",
                        color: "#fff",
                      }}
                      onClick={() => this.handleRental(item, !showFullCostume)}
                    >
                      Wypożycz
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      style={{ marginTop: "10px" }}
                      onClick={() =>
                        this.props.navigate(
                          `/details/${showFullCostume ? "stroj" : "element"}/${
                            item.id
                          }`
                        )
                      }
                    >
                      Szczegóły
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      style={{
                        marginTop: "10px",
                        borderColor: "#4caf50",
                        color: "#4caf50",
                      }}
                      onClick={() =>
                        this.handleShowRentals(item, !showFullCostume)
                      }
                    >
                      Wypożyczenia
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* DIALOGI */}
        <Dialog open={showDialog} onClose={this.cancelAction}>
          <DialogTitle>Potwierdzenie</DialogTitle>
          <DialogContent>
            <Typography variant="body1">{dialogMessage}</Typography>
            <TextField
              type="datetime-local"
              label="Data wypożyczenia"
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
              onChange={(e) =>
                this.setState({ wypozyczonoDate: new Date(e.target.value) })
              }
            />
            <br />
            <br />
            <TextField
              type="datetime-local"
              label="Data zwrotu"
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
              onChange={(e) =>
                this.setState({ rentalDate: new Date(e.target.value) })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelAction} color="secondary">
              Anuluj
            </Button>
            <Button onClick={this.confirmAction} color="primary">
              Potwierdź
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={rentalDialogOpen} onClose={this.handleCloseRentalDialog}>
          <DialogTitle>Lista wypożyczeń</DialogTitle>
          <DialogContent>
            {selectedRentals.length === 0 ? (
              <Typography>Brak wypożyczeń dla tego elementu/stroju.</Typography>
            ) : (
              selectedRentals.map((rental, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <Typography variant="body2">
                    {rental.rezerwacja ? "Rezerwacja" : "Wypożyczenie"} od:{" "}
                    {new Date(rental.wypozyczono).toLocaleString()} do:{" "}
                    {new Date(rental.zwrot).toLocaleString()}
                  </Typography>
                </div>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseRentalDialog} color="primary">
              Zamknij
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withNavigation(ReservationPage);
