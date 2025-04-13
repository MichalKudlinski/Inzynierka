import { Button, Typography, Card, CardContent } from "@material-ui/core";
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

class ReservationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      costumes: [],
      error: null,
      selectedCategory: null,
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");

    fetch("/api/stroje/stroj/list", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Błąd pobierania strojów");
        return res.json();
      })
      .then((data) => this.setState({ costumes: data }))
      .catch((err) => this.setState({ error: err.message }));
  }

  handleReserve = (costumeName) => {
    alert(`Zarezerwowano strój: ${costumeName}`);
  };

  handleFilterClick = (category) => {
    this.setState({
      selectedCategory: category === "wszystko" ? null : category,
    });
  };

  render() {
    const { costumes, error, selectedCategory } = this.state;
    const { navigate } = this.props;

    const categories = [
      "wszystko",
      "cały strój",
      "góra",
      "spodnie",
      "buty",
      "akcesoria",
      "głowa",
    ];

    // Filtrowanie — kiedy dodasz kategorię do obiektu w bazie, np. costume.category
    const filteredCostumes = selectedCategory
      ? costumes.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      : costumes;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
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
            margin: "10px",
          }}
        >
          <Typography variant="h4">Dostępne stroje ludowe</Typography>
        </div>

        {/* Filtry */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
            padding: "10px 0",
          }}
        >
          {categories.map((label) => (
            <Button
              key={label}
              variant="outlined"
              style={{
                color: "#fff",
                borderColor: "#fff",
                backgroundColor:
                  selectedCategory === label.toLowerCase()
                    ? "#a52a2a"
                    : "rgba(50, 50, 50, 0.5)",
                fontWeight: "bold",
                textShadow: "1px 1px 2px rgba(0,0,0,0.9)",
              }}
              onClick={() => this.handleFilterClick(label.toLowerCase())}
            >
              {label.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Sekcja z kostiumami */}
        <section
          style={{
            width: "100%",
            padding: "0 40px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              width: "100%",
              paddingBottom: "20px",
            }}
          >
            {error ? (
              <Typography
                style={{
                  color: "#fff",
                  textAlign: "center",
                  width: "100%",
                  backgroundColor: "rgba(90, 80, 80, 0.8)",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                {error}
              </Typography>
            ) : filteredCostumes.length === 0 ? (
              <Typography
                style={{
                  color: "#fff",
                  textAlign: "center",
                  width: "100%",
                  backgroundColor: "rgba(90, 80, 80, 0.8)",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                Brak dostępnych strojów
              </Typography>
            ) : (
              filteredCostumes.map((costume) => (
                <Card
                  key={costume.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "2px solid #d4a373",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      style={{ fontWeight: "bold", color: "#333" }}
                    >
                      {costume.name}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Region: {costume.region}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#555" }}>
                      Rozmiar: {costume.size}
                    </Typography>

                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: "#337ab7",
                        color: "#ffffff",
                        fontWeight: "bold",
                        marginTop: "10px",
                        borderRadius: "12px",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#23527c")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#337ab7")
                      }
                      onClick={() => this.handleReserve(costume.name)}
                    >
                      Zarezerwuj
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Przycisk powrotu */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            variant="contained"
            style={{
              backgroundColor: "#337ab7",
              color: "#ffffff",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "12px 24px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              transition: "background-color 0.3s ease",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#23527c")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#337ab7")}
            onClick={() => navigate("/main")}
          >
            Wróć do strony głównej
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

export const ReservationPageWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ReservationPage {...props} navigate={navigate} />;
};
