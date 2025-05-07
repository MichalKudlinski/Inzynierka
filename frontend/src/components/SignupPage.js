import { Button, Checkbox, FormControlLabel, Snackbar, TextField, Typography } from "@material-ui/core";
import React, { Component } from "react";

export default class SignUpPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      isRenter: false,  // New state for checkbox
      csrfToken: "",
      errorMessage: "",
      successMessage: false, // To handle Snackbar visibility
    };
  }

  componentDidMount() {
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
    this.setState({ csrfToken });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleCheckboxChange = (event) => {
    this.setState({ isRenter: event.target.checked });
  };

  handleSignUpButtonPressed = () => {
    const { email, password, name, csrfToken, isRenter } = this.state;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ email, password, name, is_renter: isRenter }), // Add is_renter here
    };

    fetch("/api/user/create/", requestOptions)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Invalid input");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("User created successfully:", data);
        this.setState({ errorMessage: "", successMessage: true }); // Show success message

        // Hide the success message after 3 seconds and redirect to login page
        setTimeout(() => {
          window.location.href = "/login"; // Change this URL to the correct login page URL
        }, 3000); // 3 seconds
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("Error creating user:", error);
      });
  };

  handleCloseSnackbar = () => {
    this.setState({ successMessage: false });
  };

  render() {
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
          {this.state.errorMessage && (
            <Typography
              color="error"
              variant="body1"
              style={{ marginBottom: "20px" }}
            >
              {this.state.errorMessage}
            </Typography>
          )}
          <TextField
            label="Nazwa Użytkownika"
            variant="outlined"
            fullWidth
            name="name"
            value={this.state.name}
            onChange={this.handleInputChange}
            style={{ marginBottom: "20px" }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            name="email"
            value={this.state.email}
            onChange={this.handleInputChange}
            style={{ marginBottom: "20px" }}
          />
          <TextField
            label="Hasło"
            variant="outlined"
            fullWidth
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleInputChange}
            style={{ marginBottom: "30px" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.isRenter}
                onChange={this.handleCheckboxChange}
                name="isRenter"
                color="primary"
              />
            }
            label="Chcę zostać wynajmującym"
          />
          <Button
            variant="contained"
            style={{
              backgroundColor: "#b71c1c",
              color: "white",
              fontWeight: "bold",
              padding: "15px",
            }}
            fullWidth
            onClick={this.handleSignUpButtonPressed}
          >
            Zarejestruj się
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

        {/* Snackbar for success message */}
        <Snackbar
          open={this.state.successMessage}
          autoHideDuration={3000}
          onClose={this.handleCloseSnackbar}
          message="Użytkownik zarejestrowany pomyślnie!"
        />
      </div>
    );
  }
}
