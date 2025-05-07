import {
  Button,
  Card,
  CardContent,
  Typography,
  Container,
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
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/stroje/stroj/list", {
        headers: { Authorization: `Token ${token}` },
      }),
      fetch("/api/stroje/element/list", {
        headers: { Authorization: `Token ${token}` },
      }),
      fetch("/api/wypozczenia/wypozyczenie/list", {
        headers: { Authorization: `Token ${token}` },
      }),
    ])
      .then(async ([costumeRes, elementRes, reservationRes]) => {
        if (!costumeRes.ok || !elementRes.ok || !reservationRes.ok) {
          throw new Error("Błąd pobierania danych");
        }
        const [costumesData, elementsData, reservationsData] =
          await Promise.all([
            costumeRes.json(),
            elementRes.json(),
            reservationRes.json(),
          ]);
        const now = new Date();
        const upcomingReservations = reservationsData.filter(
          (r) => new Date(r.zwrot) > now
        );
        this.setState({
          costumes: costumesData,
          elements: elementsData,
          reservations: upcomingReservations,
        });
      })
      .catch((err) => this.setState({ error: err.message }));
  }

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
    this.props.navigate("/");
  };

  render() {
    const { costumes, elements, selectedElementType, showFullCostume } =
      this.state;

    const elementCategories = [
      "nakrycie głowy",
      "koszula",
      "kamizelka",
      "akcesoria",
      "bizuteria",
      "halka",
      "sukienka",
      "buty",
      "spodnie",
    ];

    const filteredItems = showFullCostume
      ? costumes
      : elements.filter((item) =>
          selectedElementType ? item.element_type === selectedElementType : true
        );

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffebcc",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.3fr 2fr",
            alignItems: "center",
            gap: "10px",
            padding: "15px",
            backgroundColor: "#a52a2a",
            border: "3px solid #d4a373",
            borderRadius: "12px",
            margin: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #d4a373",
              borderRadius: "12px",
              padding: "5px",
              backgroundColor: "#ffffff",
              height: "60px",
              width: "60px",
            }}
          >
            <img
              src="media\uploads\images\Logo_heritagewear.webp"
              alt="Logo aplikacji"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
          <Typography
            variant="h5"
            style={{ color: "#ffffff", fontWeight: "bold", textAlign: "left"}}>
            HeritageWear Polska
          </Typography>
        </div>

        <Container style={{ flex: 1, padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Button
              onClick={() => this.props.navigate("/main")}
              variant="contained"
              style={{
                backgroundColor: "#a52a2a",
                color: "#fff",
                borderRadius: "12px",
              }}
            >
              Powrót do strony głównej
            </Button>
            <Button
              onClick={this.toggleCostumeView}
              variant="contained"
              style={{
                backgroundColor: "#337ab7",
                color: "#fff",
                borderRadius: "12px",
              }}
            >
              {showFullCostume ? "Pokaż elementy" : "Pokaż stroje"}
            </Button>
          </div>

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
                  style={{
                    borderRadius: "12px",
                    border: "2px solid #d4a373",
                    color: "#a52a2a",
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          <div
            style={{
              border: "3px solid #d4a373",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#fff7e6",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredItems.length === 0 ? (
                <Typography
                  variant="h6"
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
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "2px solid #d4a373",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography variant="body2">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Container>

        <div style={footerStyle}>
          <p>Kontakt: kontakt@heritagewear.pl | Tel: +48 123 456 789</p>
        </div>
      </div>
    );
  }
}

const footerStyle = {
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
};

export default withNavigation(ReservationPage);
