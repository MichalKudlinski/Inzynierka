import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

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
        backgroundImage: "url('XXXXXXXXXXXX')",
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
            src="XXXXXXXXXXXX"
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
          ...buttonStyle("#d9534f", "#b52b27"),
        }}
        onClick={() => navigate("/signup")}
      >
        Stwórz konto
      </div>

      <div
        style={{
          gridArea: "login",
          ...buttonStyle("#337ab7", "#23527c"),
        }}
        onClick={() => navigate("/login")}
      >
        Zaloguj
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
          src="GORAL"
          alt="Góral"
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
        <p>Tu znajdziesz ciekawe informacje o polskim folklorze...</p>
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

const buttonStyle = (bgColor, hoverColor) => ({
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
  backgroundColor: bgColor,
  transition: "background-color 0.3s ease",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  width: "80%",
  height: "50px",
  textAlign: "center",
  margin: "auto",
  ':hover': { backgroundColor: hoverColor }
});

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