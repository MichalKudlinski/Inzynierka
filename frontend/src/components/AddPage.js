import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    maxHeight: "100vh",
    backgroundColor: "#ffebcc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    overflowY: "auto",
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
    backgroundColor: "#d9534f",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#c9302c",
    },
  },

  container: {
    display: "flex",
    width: "100%",
    maxWidth: 1200,
    gap: theme.spacing(3),
  },
  formWrapper: {
    flex: 1,
    maxWidth: 700,
  },
  listWrapper: {
    width: 350,
    padding: theme.spacing(2),
    backgroundColor: "#fff",
    borderRadius: 20,
    border: "3px solid #d4a373",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflowY: "auto",
    maxHeight: "80vh",
  },
  paper: {
    padding: theme.spacing(5),
    borderRadius: 20,
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 600,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "3px solid #d4a373",
    marginBottom: theme.spacing(4),
  },
  formControl: {
    marginTop: theme.spacing(2),
  },
  fileInputWrapper: {
    marginTop: theme.spacing(3),
    display: "flex",
    alignItems: "center",
  },
  hiddenInput: {
    display: "none",
  },
  fileButton: {
    backgroundColor: "#a52a2a",
    color: "#fff",
    padding: "10px 20px",
    "&:hover": {
      backgroundColor: "#872222",
    },
  },
  submitButton: {
    marginTop: theme.spacing(4),
    backgroundColor: "#51991d",
    color: "#fff",
    padding: "12px 25px",
    "&:hover": {
      backgroundColor: "#294d0f",
    },
  },
  errorText: {
    marginTop: theme.spacing(4),
    color: theme.palette.error.main,
  },
  loadingWrapper: {
    marginTop: theme.spacing(6),
    textAlign: "center",
  },
  card: {
    marginBottom: 12,
  },
}));

const elementTypeMapping = {
  headwear: "Nakrycie głowy",
  shirt: "Koszula",
  trousers: "Spodnie",
  vest: "Kamizelka",
  shoes: "Buty",
  accessories: "Akcesoria",
  jewelry: "Biżuteria",
  petticoat: "Haleczka",
  dress: "Suknia",
};

const AddPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);
  const [stroje, setStroje] = useState([]);
  const [elementStroje, setElementStroje] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [addingOutfit, setAddingOutfit] = useState(false);

  const initialFormData = {
    name: "",
    city: "",
    description: "",
    gender: "",
    size: "",
    element_type: "",
    image: null,
    headwear: "",
    shirt: "",
    trousers: "",
    vest: "",
    shoes: "",
    accessories: "",
    jewelry: "",
    petticoat: "",
    dress: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchUserAndItems = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Brak tokenu użytkownika.");
      navigate("/login");
      return;
    }
    try {
      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      const userRes = await fetch("/api/user/me", { headers });
      if (!userRes.ok)
        throw new Error("Nie udało się pobrać danych użytkownika.");
      const userData = await userRes.json();

      if (!userData?.id || !userData?.is_renter) {
        setErrorMessage("Nie masz uprawnień do dodawania elementów.");
        navigate("/");
        return;
      }

      setUser(userData);

      const [strojeRes, elementStrojeRes] = await Promise.all([
        fetch("/api/costumes/costume/list", { headers }),
        fetch("/api/costumes/element/list", { headers }),
      ]);

      if (!strojeRes.ok || !elementStrojeRes.ok) {
        throw new Error("Błąd podczas pobierania danych.");
      }

      const strojeData = await strojeRes.json();
      const elementStrojeData = await elementStrojeRes.json();

      setStroje(strojeData.filter((s) => s.user === userData.id));
      setElementStroje(elementStrojeData.filter((e) => e.user === userData.id));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndItems();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const form = new FormData();

    try {
      if (addingOutfit) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) form.append(key, value);
        });
        form.append("user", user.id);

        const res = await fetch("/api/costumes/costume/create", {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
          body: form,
        });

        if (!res.ok) throw new Error("Nie udało się dodać stroju.");

        alert("Stroje zostały dodane.");
      } else {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && !elementTypeMapping[key]) {
            form.append(key, value);
          }
        });
        form.append("user", user.id);

        const res = await fetch("/api/costumes/element/create", {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
          body: form,
        });

        if (!res.ok) throw new Error("Nie udało się dodać elementu.");

        alert("Element został dodany.");
      }
      setFormData(initialFormData);
      await fetchUserAndItems();
    } catch (err) {
      alert(`Błąd: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItems = (title, items) => {
    const isElement = title.toLowerCase().includes("element");

    if (items.length === 0) {
      return (
        <Typography variant="body1" style={{ textAlign: "center" }}>
          Brak {isElement ? "elementów" : "strojów"}
        </Typography>
      );
    }

    return items.map((item) => {
      const isApproved = item.confirmed === true;

      const cardStyle = {
        marginBottom: 15,
        backgroundColor: isApproved ? "#e6ffe6" : "#f0f0f0",
        borderRadius: 8,
        opacity: isApproved ? 1 : 0.6,
      };

      return (
        <Card key={item.id} style={cardStyle}>
          <CardContent>
            <Typography variant="h6">{item.name}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              ID: {item.extid || item.id}
            </Typography>
            {!isApproved && (
              <Typography
                variant="body2"
                style={{ color: "#999", fontStyle: "italic", marginBottom: 10 }}
              >
                Oczekuje na zatwierdzenie
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: 10, marginRight: 10 }}
              onClick={() =>
                navigate(
                  `/details/${isElement ? "element" : "costume"}/${item.id}`
                )
              }
              disabled={!isApproved}
            >
              Szczegóły
            </Button>
            <Button
              variant="contained"
              color="secondary"
              style={{ marginTop: 10 }}
              onClick={() =>
                openDeleteConfirmation({
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
    });
  };

  const openDeleteConfirmation = (item) => {
    if (window.confirm(`Czy na pewno chcesz usunąć "${item.name}"?`)) {
      deleteItem(item);
    }
  };

  const deleteItem = async (item) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/costumes/${item.type === "element" ? "element" : "costume"}/${
          item.id
        }/delete`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error("Usunięcie nie powiodło się");
      }
      alert(`"${item.name}" został usunięty.`);
      await fetchUserAndItems();
    } catch (err) {
      alert(`Nie udało się usunąć: ${err.message}`);
    }
  };

  return (
    <div className={classes.root}>
      <Button className={classes.backButton} onClick={() => navigate("/main")}>
        Wróć
      </Button>
      <div className={classes.container}>
        <div className={classes.formWrapper}>
          <Paper className={classes.paper} elevation={3}>
            <Typography variant="h5" gutterBottom>
              {addingOutfit ? "Dodaj strój" : "Dodaj element stroju"}
            </Typography>
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Nazwa"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={classes.formControl}
              />
              <TextField
                fullWidth
                label="Miasto"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={classes.formControl}
              />
              <TextField
                fullWidth
                multiline
                label="Opis"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={classes.formControl}
              />

              {!addingOutfit && (
                <>
                  <TextField
                    select
                    fullWidth
                    label="Płeć"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className={classes.formControl}
                  >
                    <MenuItem value="male">Mężczyzna</MenuItem>
                    <MenuItem value="female">Kobieta</MenuItem>
                    <MenuItem value="unisex">Unisex</MenuItem>
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Rozmiar"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className={classes.formControl}
                  >
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Large">Large</MenuItem>
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Typ elementu"
                    name="element_type"
                    value={formData.element_type}
                    onChange={handleChange}
                    required
                    className={classes.formControl}
                  >
                    {Object.entries(elementTypeMapping).map(
                      ([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </>
              )}

              <div className={classes.fileInputWrapper}>
                <input
                  accept="image/*"
                  className={classes.hiddenInput}
                  id="image-upload"
                  type="file"
                  name="image"
                  onChange={handleChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    className={classes.fileButton}
                  >
                    Wgraj zdjęcie
                  </Button>
                </label>
                {formData.image && (
                  <span style={{ marginLeft: 10 }}>{formData.image.name}</span>
                )}
              </div>

              {addingOutfit && (
                <>
                  <Typography variant="subtitle1" style={{ marginTop: 20 }}>
                    Wybierz elementy kostiumu dla tego stroju:
                  </Typography>
                  {Object.keys(elementTypeMapping).map((key) => (
                    <TextField
                      key={key}
                      select
                      fullWidth
                      label={elementTypeMapping[key]}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className={classes.formControl}
                    >
                      <MenuItem value="">Brak</MenuItem>
                      {elementStroje
                        .filter((el) => el.element_type === key)
                        .map((el) => (
                          <MenuItem key={el.id} value={el.id}>
                            {el.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  ))}
                </>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                className={classes.submitButton}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Zatwierdź"
                )}
              </Button>
            </form>

            <Button
              style={{ marginTop: 15 }}
              variant="outlined"
              onClick={() => setAddingOutfit((prev) => !prev)}
            >
              {addingOutfit
                ? "Dodaj element zamiast tego"
                : "Dodaj strój zamiast tego"}
            </Button>

            {errorMessage && (
              <Typography className={classes.errorText}>
                {errorMessage}
              </Typography>
            )}
          </Paper>
        </div>

        <div className={classes.listWrapper}>
          <Typography variant="h6" gutterBottom style={{ textAlign: "center" }}>
            Twoje elementy
          </Typography>
          {loading ? (
            <div className={classes.loadingWrapper}>
              <CircularProgress />
            </div>
          ) : (
            renderItems("Elements", elementStroje)
          )}

          <Typography
            variant="h6"
            gutterBottom
            style={{ marginTop: 20, textAlign: "center" }}
          >
            Twoje stroje
          </Typography>
          {loading ? (
            <div className={classes.loadingWrapper}>
              <CircularProgress />
            </div>
          ) : (
            renderItems("Outfits", stroje)
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPage;
