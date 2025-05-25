import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [wiadomosci, setWiadomosci] = useState([]);

  useEffect(() => {
    const fetchWiadomosci = async () => {
      try {
        const res = await fetch("/api/news/list");
        if (!res.ok) throw new Error("Błąd podczas pobierania wiadomości");
        const data = await res.json();

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const recentMessages = data.filter((msg) => {
          const created = new Date(msg.created_at);
          return created >= thirtyDaysAgo && created <= now;
        });

        setWiadomosci(recentMessages);
      } catch (error) {
        console.error("❌ Błąd ładowania wiadomości:", error);
      }
    };

    fetchWiadomosci();
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateAreas: `
          'logo signup login'
          'image image info'
          'footer footer footer'
        `,
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "2fr 1fr 1fr",
        height: "100vh",
        gap: "20px",
        padding: "10px",
        backgroundColor: "#ffebcc",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          gridArea: "logo / logo / login / login",
          display: "grid",
          gridTemplateColumns: "0.3fr 2fr",
          alignItems: "center",
          gap: "10px",
          padding: "15px",
          backgroundColor: "#a52a2a",
          border: "3px solid #d4a373",
          borderRadius: "12px",
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
            src="/media\uploads\images\Logo_heritagewear.webp"
            alt="Logo aplikacji"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
        <Typography
          variant="h5"
          style={{ color: "#ffffff", fontWeight: "bold", textAlign: "left" }}
        >
          HeritageWear Polska
        </Typography>
      </div>

      <div
        style={{
          gridArea: "signup",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HoverButton
          text="Załóż konto"
          bgColor="#d9534f"
          hoverColor="#b52b27"
          onClick={() => navigate("/signup")}
        />
      </div>

      <div
        style={{
          gridArea: "login",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HoverButton
          text="Zaloguj"
          bgColor="#337ab7"
          hoverColor="#23527c"
          onClick={() => navigate("/login")}
        />
      </div>

      <div
        style={{
          gridArea: "image",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src="/media\uploads\images\Kwiaty_folk.webp"
          alt="Kwiaty"
          style={{ width: "70%", height: "70%", objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          gridArea: "info",
          ...infoBoxStyle,
        }}
      >
        <h2>Informacje z Polskiego Folku</h2>
        {wiadomosci.length > 0 ? (
          <ul
            style={{
              marginTop: "10px",
              paddingLeft: "20px",
              textAlign: "left",
              listStylePosition: "inside",
            }}
          >
            {wiadomosci.map((msg) => (
              <li
                key={msg.id}
                style={{
                  marginBottom: "12px",
                  lineHeight: 1.5,
                }}
              >
                <strong>{msg.name}</strong> — {msg.text}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontStyle: "italic", marginTop: "10px" }}>
            Brak wiadomości z ostatnich 30 dni.
          </p>
        )}
      </div>

      <div
        style={{
          gridArea: "footer",
          ...footerStyle,
        }}
      >
        <p>Kontakt: kontakt@heritagewear.pl | Tel: +48 123 456 789</p>
      </div>
    </div>
  );
};

const HoverButton = ({ text, bgColor, hoverColor, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #d4a373",
        borderRadius: "12px",
        padding: "12px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: hover ? hoverColor : bgColor,
        transition: "background-color 0.3s ease",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        width: "80%",
        height: "50px",
        textAlign: "center",
        margin: "auto",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

const infoBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  border: "3px solid #d4a373",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  fontSize: "1.2rem",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#ffffff",
};

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

export default HomePage;
