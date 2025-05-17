import {
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Nazwa, setNazwa] = useState("");
  const [phone, setPhone] = useState("");
  const [isRenter, setIsRenter] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  // New state to track field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    Nazwa: "",
    email: "",
    password: "",
    phone: "",
  });

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const getCookie = (name) => {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith(`${name}=`)) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    };
    const csrfToken = getCookie("csrftoken");
    setCsrfToken(csrfToken);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "Nazwa") setNazwa(value);
    if (name === "phone") setPhone(value);

    // Clear the field-specific error on input change
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    // Also clear general error
    setErrorMessage("");
  };

  const handleCheckboxChange = (event) => {
    setIsRenter(event.target.checked);
    // Clear phone errors if toggling off
    if (!event.target.checked) {
      setFieldErrors((prev) => ({ ...prev, phone: "" }));
      setPhone("");
    }
  };

  // Validate inputs individually and set errors accordingly
  const validateInputs = () => {
    let isValid = true;
    const newFieldErrors = {
      Nazwa: "",
      email: "",
      password: "",
      phone: "",
    };

    if (!Nazwa.trim()) {
      newFieldErrors.Nazwa = "Nazwa jest wymagana.";
      isValid = false;
    }

    // Basic email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Nieprawidłowy adres e-mail.";
      isValid = false;
    }

    // Password min 8 chars, at least one uppercase, one lowercase and one number
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      newFieldErrors.password =
        "Hasło min. 8 znaków, 1 wielka litera, 1 mała litera, 1 cyfra.";
      isValid = false;
    }

    if (isRenter) {
      if (!phone || phone.length !== 9 || !/^\d{9}$/.test(phone)) {
        newFieldErrors.phone = "Numer telefonu musi mieć dokładnie 9 cyfr.";
        isValid = false;
      }
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSignUpButtonPressed = () => {
    if (!validateInputs()) {
      setErrorMessage("Proszę poprawić błędy w formularzu.");
      return;
    }

    const requestBody = { email, password, name: Nazwa, is_renter: isRenter };
    if (isRenter) {
      requestBody.phone_number = phone;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(requestBody),
    };

    fetch("/api/user/create/", requestOptions)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            if (typeof data === "object") {
              const apiFieldErrors = {};
              let combinedMsg = "";


              const translations = {
                "user with this email already exists.": "Użytkownik z tym adresem email już istnieje.",
                "user with this name already exists.": "Nazwa jest już zajęta.",
              };

              Object.entries(data).forEach(([key, val]) => {
                if (Array.isArray(val)) {

                  const translatedMessages = val.map(
                    (msg) => translations[msg.toLowerCase()] || msg
                  );

                  const errorKey = key === "name" ? "Nazwa" : key;
                  apiFieldErrors[errorKey] = translatedMessages.join(", ");
                  combinedMsg += `${errorKey}: ${apiFieldErrors[errorKey]} | `;
                } else {
                  const errorKey = key === "name" ? "Nazwa" : key;
                  apiFieldErrors[errorKey] =
                    translations[val.toLowerCase()] || val;
                  combinedMsg += `${errorKey}: ${apiFieldErrors[errorKey]} | `;
                }
              });
              setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
              throw new Error(combinedMsg.slice(0, -3));
            }
            throw new Error(data.error || "Nieprawidłowe dane wejściowe");
          });
        }
        return response.json();
      })
      .then(() => {
        setSuccessMessage(true);
        setErrorMessage("");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "Wystąpił błąd podczas tworzenia użytkownika."
        );
        console.error("Błąd tworzenia użytkownika:", error);
      });
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(false);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateAreas: ` 'image-left form image-right' 'image-left form image-right' `,
        gridTemplateColumns: "1fr 2fr 1fr",
        height: "100vh",
        gap: "20px",
        padding: "10px",
        backgroundColor: "#fbeec1",
        backgroundSize: "cover",
        fontFamily: "'Lobster', cursive",
      }}
    >
      <div
        style={{
          gridArea: "image-left",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/media\uploads\images\lowiczanka.webp"
          alt="Postać ludowa"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>

      <div
        style={{
          gridArea: "form",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffffcc",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          component="h4"
          variant="h4"
          style={{ marginBottom: "30px", color: "#b71c1c" }}
        >
          Rejestracja
        </Typography>
        {errorMessage && (
          <Typography
            color="error"
            variant="body1"
            style={{ marginBottom: "20px" }}
          >
            {errorMessage}
          </Typography>
        )}
        <TextField
          label="Nazwa Użytkownika"
          variant="outlined"
          fullWidth
          name="Nazwa"
          value={Nazwa}
          onChange={handleInputChange}
          style={{ marginBottom: "20px" }}
          error={Boolean(fieldErrors.Nazwa)}
          helperText={fieldErrors.Nazwa}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          name="email"
          value={email}
          onChange={handleInputChange}
          style={{ marginBottom: "20px" }}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
        />
        <TextField
          label="Hasło"
          variant="outlined"
          fullWidth
          type="password"
          name="password"
          value={password}
          onChange={handleInputChange}
          style={{ marginBottom: "20px" }}
          error={Boolean(fieldErrors.password)}
          helperText={
            fieldErrors.password ||
            "Hasło min. 8 znaków, 1 wielka litera, 1 mała litera, 1 cyfra."
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isRenter}
              onChange={handleCheckboxChange}
              name="isRenter"
              color="primary"
            />
          }
          label="Chcę zostać wynajmującym"
          style={{ marginBottom: "20px" }}
        />

        {isRenter && (
          <TextField
            label="Numer telefonu (9 cyfr)"
            variant="outlined"
            fullWidth
            name="phone"
            value={phone}
            onChange={handleInputChange}
            inputProps={{ maxLength: 9 }}
            style={{ marginBottom: "30px" }}
            error={Boolean(fieldErrors.phone)}
            helperText={fieldErrors.phone}
          />
        )}

        <Button
          variant="contained"
          style={{
            backgroundColor: "#b71c1c",
            color: "white",
            fontWeight: "bold",
            padding: "15px",
          }}
          fullWidth
          onClick={handleSignUpButtonPressed}
        >
          Zarejestruj się
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          style={{
            fontSize: "1rem",
            textTransform: "none",
            marginTop: "10px",
            padding: "10px 20px",
            borderRadius: "25px",
            transition: "all 0.3s ease",
            border: "2px solid #6c757d",
            color: "#6c757d",
            backgroundColor: "white",
          }}
          onClick={() => navigate("/")}
        >
          Wróć do strony głównej
        </Button>
      </div>

      <div
        style={{
          gridArea: "image-right",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="\media\uploads\images\lowicz.webp"
          alt="Postać ludowa"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
      <Snackbar
        open={successMessage}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        message="Użytkownik zarejestrowany pomyślnie!"
      />
    </div>
  );
}
