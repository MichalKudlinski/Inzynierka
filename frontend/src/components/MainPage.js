import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      rentals: [],
      reservations: [],
      costumes: [],
      elements: [],
      errorMessage: "",
      allOwnedCostumes: [],
      allOwnedElements: [],
      deleteConfirmationOpen: false,
      itemToDelete: null,
      extendDialogOpen: false,
      daysToExtend: 1,
      rentalToExtend: null,
      confirmReservationDialogOpen: false,
      reservationToConfirm: null,
    };
  }

  componentDidMount() {
    this.handleSendReminders = this.handleSendReminders.bind(this);
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
          this.handleSendReminders(); // <-- Call send_reminders API here
          this.fetchRenterData(headers);
        } else {
          this.fetchNonRenterData(headers, user.id);
        }
      })
      .catch(() => {
        this.setState({ errorMessage: "Błąd pobierania użytkownika." });
      });
  }

  // Handle deleting the item after user confirmation
  async deleteItemConfirmed() {
    const { itemToDelete, rentals, reservations } = this.state;
    const token = localStorage.getItem("token");
    if (!token) {
      this.setState({ errorMessage: "Nie znaleziono tokenu użytkownika." });
      return;
    }

    // Check if item is currently rented or reserved
    const hasCurrentOrFutureRental = [...rentals, ...reservations].some(
      (rental) => {
        if (itemToDelete.type === "costume") {
          return rental.costume === itemToDelete.id;
        } else if (itemToDelete.type === "element") {
          return rental.element === itemToDelete.id;
        }
        return false;
      }
    );

    if (hasCurrentOrFutureRental) {
      this.setState({
        errorMessage:
          "Nie można usunąć elementu, ponieważ jest aktualnie wypożyczony lub zarezerwowany.",
        deleteConfirmationOpen: false,
        itemToDelete: null,
      });
      return;
    }

    const headers = {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };

    let url = "";
    if (itemToDelete.type === "costume") {
      url = `/api/costumes/costume${itemToDelete.id}/delete`;
    } else if (itemToDelete.type === "element") {
      url = `/api/costumes/element${itemToDelete.id}/delete`;
    } else {
      url = `/api/rentals/${itemToDelete.id}/delete`;
    }

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć przedmiotu.");
      }

      this.setState((prevState) => {
        let updatedState = {
          deleteConfirmationOpen: false,
          itemToDelete: null,
        };

        if (itemToDelete.type === "costume") {
          updatedState.allOwnedCostumes = prevState.allOwnedCostumes.filter(
            (s) => s.id !== itemToDelete.id
          );
        } else if (itemToDelete.type === "element") {
          updatedState.allOwnedElements = prevState.allOwnedElements.filter(
            (e) => e.id !== itemToDelete.id
          );
        } else {
          updatedState.rentals = prevState.rentals.filter(
            (r) => r.id !== itemToDelete.id
          );
          updatedState.reservations = prevState.reservations.filter(
            (r) => r.id !== itemToDelete.id
          );
        }

        return updatedState;
      });
    } catch (error) {
      this.setState({ errorMessage: "Błąd przy usuwaniu przedmiotu." });
    }
  }

  openExtendDialog = (item) => {
    this.setState({
      extendDialogOpen: true,
      rentalToExtend: item,
      daysToExtend: 1,
    });
  };
  openDeleteConfirmation(item) {
    this.setState({
      deleteConfirmationOpen: true,
      itemToDelete: item,
    });
  }
  calculateTimeLeft(futureDate) {
    const totalMs = new Date(futureDate) - new Date();
    if (totalMs <= 0) return "czas minął";

    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  }
  // Close the confirmation dialog
  closeDeleteConfirmation() {
    this.setState({
      deleteConfirmationOpen: false,
      itemToDelete: null,
    });
  }

  async handleSendReminders() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Brak tokenu. Zaloguj się ponownie.");
      return;
    }

    try {
      console.log("Calling /api/rentals/send-reminders/");
      const res = await fetch("/api/rentals/send-reminders/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("send‑reminders failed:", data);
        throw new Error(data.detail || "Nie udało się wysłać przypomnień");
      }

      const json = await res.json();
      console.log("send‑reminders response:", json);
      alert(`Wysłano przypomnienia dla ${json.sent} wypożyczeń.`);
    } catch (err) {
      console.error(err);
    }
  }

  async fetchRenterData(headers) {
    try {
      const [costumesRes, elementsRes] = await Promise.all([
        fetch("/api/costumes/costume/list", { headers }),
        fetch("/api/costumes/element/list", { headers }),
      ]);

      const [costumes, elements] = await Promise.all([
        costumesRes.json(),
        elementsRes.json(),
      ]);

      this.setState({ costumes, elements });

      const rentalsRes = await fetch("/api/rentals/list", { headers });
      const allRentals = await rentalsRes.json();

      const filtered = allRentals.filter((rental) => {
        const costumeObj = costumes.find((s) => s.id === rental.costume);
        const elementsObj = elements.find((e) => e.id === rental.element);
        return (
          (costumeObj?.user === this.state.user.id ||
            elementsObj?.user === this.state.user.id) &&
          this.isCurrentOrFuture(rental)
        );
      });

      const rental = filtered.reduce(
        (acc, rental) => {
          if (rental.reservation) acc.reservations.push(rental);
          else acc.rentals.push(rental);
          return acc;
        },
        { rentals: [], reservations: [] }
      );

      this.setState({
        rentals: rental.rentals,
        reservations: rental.reservations,
        allOwnedCostumes: costumes.filter((s) => s.user === this.state.user.id),
        allOwnedElements: elements.filter((e) => e.user === this.state.user.id),
      });
    } catch {
      this.setState({ errorMessage: "Błąd pobierania danych wynajmującego." });
    }
  }

  async fetchNonRenterData(headers, userId) {
    try {
      const [costumeRes, elementRes] = await Promise.all([
        fetch("/api/costumes/costume/list", { headers }),
        fetch("/api/costumes/element/list", { headers }),
      ]);

      const [costumes, elements] = await Promise.all([
        costumeRes.json(),
        elementRes.json(),
      ]);

      const rentalsRes = await fetch("/api/rentals/list", { headers });
      const rentals = await rentalsRes.json();

      const filteredRentals = rentals.filter((rental) => {
        const isDirectUser = rental.user === userId;

        const costumeUser =
          typeof rental.costume === "object"
            ? rental.costume?.user
            : costumes.find((s) => s.id === rental.costume)?.user;

        const elementUser =
          typeof rental.element === "object"
            ? rental.element?.user
            : elements.find((e) => e.id === rental.element)?.user;

        return (
          (isDirectUser || costumeUser === userId || elementUser === userId) &&
          this.isCurrentOrFuture(rental)
        );
      });

      const splitRentals = filteredRentals.reduce(
        (acc, rental) => {
          if (rental.reservation) acc.reservations.push(rental);
          else acc.rentals.push(rental);
          return acc;
        },
        { rentals: [], reservations: [] }
      );

      this.setState({
        costumes,
        elements,
        rentals: splitRentals.rentals,
        reservations: splitRentals.reservations,
      });
    } catch {
      this.setState({
        errorMessage: "Błąd pobierania danych osoby wynajmującej.",
      });
    }
  }
  extendRental = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      this.setState({ errorMessage: "Nie znaleziono tokenu użytkownika." });
      return;
    }

    const { extendDays, rentalToExtend } = this.state;

    if (!rentalToExtend) {
      alert("Brak danych o wypożyczeniu do przedłużenia.");
      return;
    }

    if (!extendDays || extendDays <= 0) {
      alert("Podaj poprawną liczbę dni.");
      return;
    }

    const headers = {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const currentReturnDate = new Date(rentalToExtend.return_date);
      const newReturnDate = new Date(currentReturnDate);
      newReturnDate.setDate(newReturnDate.getDate() + Number(extendDays));

      const formattedNewReturnDate = newReturnDate.toISOString().split("T")[0];

      const response = await fetch(
        `/api/rentals/${rentalToExtend.id}/update/`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ return_date: formattedNewReturnDate }),
        }
      );

      if (!response.ok)
        throw new Error("Błąd przy wysyłaniu danych do serwera");

      await response.json();

      alert("Wypożyczenie zostało przedłużone.");

      window.location.reload();
    } catch (error) {
      console.error("Błąd przy wydłużaniu wypożyczenia:", error);
      alert("Nie udało się wydłużyć wypożyczenia.");
    }
  };
  handleReservationToRental = async (itemId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      this.setState({ errorMessage: "Nie znaleziono tokenu użytkownika." });
      return;
    }

    try {
      const response = await fetch(`/api/rentals/${itemId}/update/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservation: false }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować rezerwacji.");
      }

      // Refresh the data after successful update
      this.componentDidMount(); // Re-fetch data
    } catch (error) {
      console.error(error);
      this.setState({
        errorMessage: "Błąd przy zmianie rezerwacji na wypożyczenie.",
      });
    }
  };
  // Helper function to check if the rental is current or future
  isCurrentOrFuture(rental) {
    const currentDate = new Date();
    const returnDate = rental.return_date ? new Date(rental.return_date) : null;
    return !returnDate || returnDate >= currentDate;
  }

  handleLogout = () => {
    localStorage.removeItem("token");
    this.props.navigate("/");
  };
  openConfirmReservationDialog = (reservation) => {
    this.setState({
      confirmReservationDialogOpen: true,
      reservationToConfirm: reservation,
    });
  };

  closeConfirmReservationDialog = () => {
    this.setState({
      confirmReservationDialogOpen: false,
      reservationToConfirm: null,
    });
  };

  confirmReservation = async () => {
    const { reservationToConfirm } = this.state;
    if (!reservationToConfirm) return;

    await this.handleReservationToRental(reservationToConfirm.id);
    this.closeConfirmReservationDialog();
  };
  renderList(title, items, costumes, elements) {
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
        {title === "Rezerwacje"
          ? "Brak rezerwacji"
          : `Brak ${title.toLowerCase()}`}
      </Typography>
    ) : (
      items.map((item) => {
        const name = (() => {
          if (item.costume) {
            return typeof item.costume === "object"
              ? item.costume.name
              : costumes.find((s) => s.id === item.costume)?.name ||
                  "Strój nieznany";
          }
          if (item.element) {
            return typeof item.element === "object"
              ? item.element.name
              : elements.find((e) => e.id === item.element)?.name ||
                  "Element stroju nieznany";
          }
          return "Nieznany przedmiot";
        })();

        const wypozyczonoDate = new Date(item.rented);
        const zwrotDate = new Date(item.return_date);
        const now = new Date();

        const showTimer =
          !this.state.user?.is_renter &&
          item.rented &&
          item.return_date &&
          wypozyczonoDate <= now &&
          zwrotDate > now;

        const timeLeft = showTimer ? this.calculateTimeLeft(zwrotDate) : null;

        // Log the calculated time left, if applicable
        if (timeLeft) {
          console.log("Time left:", timeLeft);
        } else {
          console.log("No timer to show.");
        }

        return (
          <Card
            key={item.id}
            style={{
              marginBottom: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <CardContent>
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2">
                Wypożyczenie: {formatDate(item.rented)}
              </Typography>
              <Typography variant="body2">
                Zwrot: {formatDate(item.return_date)}
              </Typography>
              {showTimer && (
                <Typography
                  variant="body2"
                  style={{ color: "green", marginTop: "5px" }}
                >
                  Pozostało: {timeLeft}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "10px" }}
                onClick={() => this.openDeleteConfirmation(item)}
              >
                Usuń
              </Button>

              <Button
                variant="contained"
                color="default"
                style={{ marginTop: "10px", marginLeft: "10px" }}
                onClick={() => this.openExtendDialog(item)}
              >
                Wydłuż
              </Button>
              {item.reservation && (
                <Button
                  variant="contained"
                  color="secondary"
                  style={{ marginTop: "10px", marginLeft: "10px" }}
                  onClick={() => this.openConfirmReservationDialog(item)}
                >
                  Potwierdź
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })
    );
  }

  renderOwnedItems(title, items) {
    const isElement = title.includes("element");

    const elementTypeMapping = {
      nakrycie_glowy: "headwear",
      koszula: "shirt",
      spodnie: "trousers",
      kamizelka: "vest",
      buty: "shoes",
      akcesoria: "accessories",
      bizuteria: "jewelry",
      halka: "petticoat",
      sukienka: "dress",
    };

    return items.length === 0 ? (
      <Typography variant="body1" style={{ textAlign: "center" }}>
        Brak {title.toLowerCase()}
      </Typography>
    ) : (
      items.map((item) => {
        const isApproved = item.confirmed === true;
        const cardStyle = {
          marginBottom: "15px",
          backgroundColor: isApproved ? "#e6ffe6" : "#f0f0f0",
          borderRadius: "8px",
          opacity: isApproved ? 1 : 0.6,
        };

        // Normalize element_type key by replacing spaces with underscores and lowercasing
        const normalizedKey = item.element_type
          ? item.element_type.toLowerCase().replace(/\s+/g, "_")
          : null;

        const elementTypeEnglish = normalizedKey
          ? elementTypeMapping[normalizedKey] || item.element_type
          : "Unknown";

        return (
          <Card key={item.id} style={cardStyle}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2">ID: {item.extid}</Typography>
              {isElement && item.element_type && (
                <Typography variant="body2">
                  Type: {elementTypeEnglish}
                </Typography>
              )}
              {!isApproved && (
                <Typography
                  variant="body2"
                  style={{
                    color: "#999",
                    fontStyle: "italic",
                    marginBottom: "10px",
                  }}
                >
                  Oczekiwanie na zatwierdzenie
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "10px", marginRight: "10px" }}
                onClick={() =>
                  this.props.navigate(
                    `/details/${isElement ? "element" : "stroj"}/${item.id}`
                  )
                }
                disabled={!isApproved}
              >
                Szczegóły
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginTop: "10px" }}
                onClick={() =>
                  this.openDeleteConfirmation({
                    ...item,
                    type: isElement ? "element" : "costume",
                  })
                }
                disabled={!isApproved}
              >
                Usuń
              </Button>
            </CardContent>
          </Card>
        );
      })
    );
  }

  render() {
    const {
      user,
      rentals,
      reservations,
      costumes,
      elements,
      errorMessage,
      deleteConfirmationOpen,
      itemToDelete,
      extendDialogOpen,
      extendDays,
      rentalToExtend,
    } = this.state;

    const { navigate } = this.props;

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

    return (
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#ffebcc",
        }}
      >
        {/* Header */}
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
          }}
        >
          <Typography variant="h4" style={{ flexGrow: 1, textAlign: "center" }}>
            Witamy cię na stronie głównej!
          </Typography>
        </div>

        {/* User info */}
        <div
          style={{
            border: "3px solid #d4a373",
            borderRadius: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#fff",
            padding: "20px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {errorMessage ? (
            <Typography color="error">{errorMessage}</Typography>
          ) : user ? (
            <>
              <Typography variant="h6">Witaj, {user.name}!</Typography>
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

        {/* Rentals and Reservations */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              border: "3px solid #d4a373",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "20px",
            }}
          >
            <Typography
              variant="h5"
              style={{ textAlign: "center", marginBottom: "10px" }}
            >
              {user?.is_renter
                ? "Wypożyczenia Twoich przedmiotów"
                : "Twoje wypożyczenia"}
            </Typography>
            {this.renderList("Wypożyczenia", rentals, costumes, elements)}
          </div>
          <div
            style={{
              border: "3px solid #d4a373",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "20px",
            }}
          >
            <Typography
              variant="h5"
              style={{ textAlign: "center", marginBottom: "10px" }}
            >
              {user?.is_renter
                ? "Rezerwacje Twoich przedmiotów"
                : "Twoje rezerwacje"}
            </Typography>
            {this.renderList("Rezerwacje", reservations, costumes, elements)}
          </div>
        </div>

        {/* Owned items for renters */}
        {user?.is_renter && (
          <div style={{ marginTop: "30px" }}>
            <Typography variant="h5" style={{ textAlign: "center" }}>
              Twoje stroje
            </Typography>
            {this.renderOwnedItems("stroje", this.state.allOwnedCostumes)}
            <Typography
              variant="h5"
              style={{ textAlign: "center", marginTop: "20px" }}
            >
              Twoje elementy stroju
            </Typography>
            {this.renderOwnedItems(
              "elementy stroju",
              this.state.allOwnedElements
            )}
          </div>
        )}

        {!user?.is_renter && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: "#337ab7",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "14px 24px",
                fontSize: "16px",
              }}
              onClick={() => navigate("/rentals")}
            >
              Przeglądaj dostępne stroje
            </Button>
          </div>
        )}
        {this.state.user?.is_renter && (
          <Button
            variant="contained"
            color="primary"
            style={{ marginBottom: "20px" }}
            onClick={() => navigate("/add")}
          >
            Dodaj nowy przedmiot
          </Button>
        )}

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteConfirmationOpen}
          onClose={() => this.closeDeleteConfirmation()}
        >
          <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
          <DialogContent>
            <Typography>Czy na pewno chcesz usunąć ten przedmiot?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.closeDeleteConfirmation()}
              color="primary"
            >
              Anuluj
            </Button>
            <Button
              onClick={() => this.deleteItemConfirmed()}
              color="secondary"
            >
              Tak
            </Button>
          </DialogActions>
        </Dialog>

        {/* Wydłuż dialog */}
        <Dialog
          open={extendDialogOpen}
          onClose={() => this.setState({ extendDialogOpen: false })}
        >
          <DialogTitle>Wydłuż wypożyczenie</DialogTitle>
          <DialogContent>
            <Typography>Na ile dni chcesz wydłużyć?</Typography>
            <input
              type="number"
              min="1"
              value={extendDays}
              onChange={(e) =>
                this.setState({ extendDays: parseInt(e.target.value) || "" })
              }
              style={{ width: "100%", marginTop: "10px", padding: "8px" }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ extendDialogOpen: false })}
              color="primary"
            >
              Anuluj
            </Button>
            <Button onClick={() => this.extendRental()} color="secondary">
              Potwierdź
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.confirmReservationDialogOpen}
          onClose={this.closeConfirmReservationDialog}
        >
          <DialogTitle>Potwierdzenie</DialogTitle>
          <DialogContent>
            <Typography>
              Czy jesteś pewny, że chcesz potwierdzić wypożyczenie?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.closeConfirmReservationDialog}
              color="default"
            >
              Anuluj
            </Button>
            <Button onClick={this.confirmReservation} color="primary">
              Tak, potwierdź
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={Boolean(this.state.errorMessage)}
          onClose={() => this.setState({ errorMessage: "" })}
        >
          <DialogTitle>Błąd</DialogTitle>
          <DialogContent>
            <Typography>{this.state.errorMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ errorMessage: "" })}
              color="primary"
            >
              Zamknij
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default function MainPageWithNavigate(props) {
  let navigate = useNavigate();
  return <MainPage {...props} navigate={navigate} />;
}
