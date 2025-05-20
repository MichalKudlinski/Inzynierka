import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    maxHeight: '100vh',
    backgroundColor: '#ffebcc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    overflowY: 'auto',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
    backgroundColor: '#6b4c3b',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#4e3a2c',
    },
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: 1200,
    gap: theme.spacing(3),
  },
  formWrapper: {
    flex: 1,
    maxWidth: 700,
  },
  listWrapper: {
    width: 350, // smaller fixed width
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderRadius: 20,
    border: '3px solid #d4a373',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    maxHeight: '80vh', // scroll if too tall
  },
  paper: {
    padding: theme.spacing(5),
    borderRadius: 20,
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 600,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '3px solid #d4a373',
    marginBottom: theme.spacing(4),
  },
  formControl: {
    marginTop: theme.spacing(2),
  },
  fileInputWrapper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
  },
  hiddenInput: {
    display: 'none',
  },
  fileButton: {
    backgroundColor: '#a52a2a',
    color: '#fff',
    padding: '10px 20px',
    '&:hover': {
      backgroundColor: '#872222',
    },
  },
  submitButton: {
    marginTop: theme.spacing(4),
    backgroundColor: '#a52a2a',
    color: '#fff',
    padding: '12px 25px',
    '&:hover': {
      backgroundColor: '#872222',
    },
  },
  errorText: {
    marginTop: theme.spacing(4),
    color: theme.palette.error.main,
  },
  loadingWrapper: {
    marginTop: theme.spacing(6),
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
  },
}));
const AddPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [stroje, setStroje] = useState([]);
  const [elementStroje, setElementStroje] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [addingOutfit, setAddingOutfit] = useState(false); // <-- toggle mode

  const [formData, setFormData] = useState({

    name: '',
    city: '',
    description: '',
    gender: '',
    size: '',
    element_type: '',
    image: null,


    nakrycie_glowy: '',
    koszula: '',
    spodnie: '',
    kamizelka: '',
    buty: '',
    akcesoria: '',
    bizuteria: '',
    halka: '',
    sukienka: '',
  });

  useEffect(() => {
    const fetchUserAndItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Nie znaleziono tokenu użytkownika.');
        navigate('/login');
        return;
      }
      const headers = {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const userRes = await fetch('/api/user/me', { headers });
        if (!userRes.ok) throw new Error('Błąd pobierania użytkownika.');
        const userData = await userRes.json();

        if (!userData || !userData.id || !userData.is_renter) {
          setErrorMessage('Brak uprawnień do dodawania elementów.');
          navigate('/');
          return;
        }
        setUser(userData);

        const [strojeRes, elementStrojeRes] = await Promise.all([
          fetch('/api/costumes/costume/list', { headers }),
          fetch('/api/costumes/element/list', { headers }),
        ]);

        if (!strojeRes.ok || !elementStrojeRes.ok) {
          throw new Error('Błąd pobierania strojów i elementów stroju.');
        }

        const strojeData = await strojeRes.json();
        const elementStrojeData = await elementStrojeRes.json();

        setStroje(strojeData.filter((s) => s.user === userData.id));
        setElementStroje(elementStrojeData.filter((e) => e.user === userData.id));
      } catch (err) {
        setErrorMessage(err.message || 'Coś poszło nie tak.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndItems();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const form = new FormData();

      if (addingOutfit) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) {
            form.append(key, value);
          }
        });
        if (user && user.id) {
          form.append('user', user.id);
        }

        const res = await fetch('/api/costumes/costume/create', {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
          },
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(JSON.stringify(err));
        }
        alert('Strój dodany pomyślnie!');
        window.location.reload(); // <-- reload page after successful add

      } else {
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== null &&
            key !== 'nakrycie_glowy' &&
            key !== 'koszula' &&
            key !== 'spodnie' &&
            key !== 'kamizelka' &&
            key !== 'buty' &&
            key !== 'akcesoria' &&
            key !== 'bizuteria' &&
            key !== 'halka' &&
            key !== 'sukienka'
          ) {
            form.append(key, value);
          }
        });
        if (user && user.id) {
          form.append('user', user.id);
        }

        const res = await fetch('/api/costumes/element/create', {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
          },
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(JSON.stringify(err));
        }
        alert('Element dodany pomyślnie!');
        window.location.reload(); // <-- reload page after successful add
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Błąd przy dodawaniu elementu/stroju.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItems = (title, items) => {
    const isElement = title.toLowerCase().includes("element");

    if (items.length === 0) {
      return (
        <Typography variant="body1" style={{ textAlign: "center" }}>
          Brak {title.toLowerCase()}
        </Typography>
      );
    }

    return items.map((item) => {
      const isApproved = item.confirmed === true;
      const cardStyle = {
        marginBottom: "15px",
        backgroundColor: isApproved ? "#e6ffe6" : "#f0f0f0",
        borderRadius: "8px",
        opacity: isApproved ? 1 : 0.6,
      };

      return (
        <Card key={item.id} style={cardStyle}>
          <CardContent>
            <Typography variant="h6">{item.name}</Typography>
            {item.element_type && (
              <Typography variant="body2" color="textSecondary">
                {item.element_type}
              </Typography>
            )}
            {!isApproved && (
              <Typography
                variant="body2"
                style={{ color: "#999", fontStyle: "italic", marginTop: "8px" }}
              >
                Oczekiwanie na zatwierdzenie
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    });
  }


  if (loading) {
    return (
      <div className={classes.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Typography variant="h6" align="center" className={classes.errorText}>
        {errorMessage}
      </Typography>
    );
  }

  return (
    <div className={classes.root}>
      <Button variant="contained" className={classes.backButton} onClick={() => navigate(-1)}>
        Powrót
      </Button>

      <Typography variant="h4" gutterBottom>
        {addingOutfit ? 'Dodaj nowy strój' : 'Dodaj nowy element stroju'}
      </Typography>

      <Button
        variant="outlined"
        color="primary"
        onClick={() => setAddingOutfit(!addingOutfit)}
        style={{ marginBottom: 20 }}
      >
        {addingOutfit ? 'Dodaj element stroju' : 'Dodaj strój'}
      </Button>

      {user && (
        <div className={classes.container}>
          <div className={classes.formWrapper}>
            <Paper className={classes.paper} elevation={3}>
              <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                {/* Common fields for both */}
                <TextField
                  fullWidth
                  label="Nazwa"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Miasto"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Opis"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  select
                  fullWidth
                  label="Płeć"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                >
                  <MenuItem value="">Wybierz płeć</MenuItem>
                  <MenuItem value="meski">Męski</MenuItem>
                  <MenuItem value="damski">Damski</MenuItem>
                  <MenuItem value="unisex">Unisex</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Rozmiar"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                >
                  <MenuItem value="">Rozmiar</MenuItem>
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                </TextField>

                {addingOutfit ? (
                  <>
                    {/* Select for each outfit element */}
                    {[
                      { label: 'Nakrycie głowy', name: 'nakrycie_glowy' },
                      { label: 'Koszula', name: 'koszula' },
                      { label: 'Spodnie', name: 'spodnie' },
                      { label: 'Kamizelka', name: 'kamizelka' },
                      { label: 'Buty', name: 'buty' },
                      { label: 'Akcesoria', name: 'akcesoria' },
                      { label: 'Biżuteria', name: 'bizuteria' },
                      { label: 'Halka', name: 'halka' },
                      { label: 'Sukienka', name: 'sukienka' },
                    ].map(({ label, name }) => (
                      <TextField
                        key={name}
                        select
                        fullWidth
                        label={label}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                      >
                        <MenuItem value="">Brak</MenuItem>
                        {elementStroje
                          .filter((el) => el.confirmed === true && el.element_type === name.replace('_', ' ')) // approximate match
                          .map((el) => (
                            <MenuItem key={el.id} value={el.id}>
                              {el.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Original element form fields */}
                    <TextField
                      select
                      fullWidth
                      label="Typ elementu"
                      name="element_type"
                      value={formData.element_type}
                      onChange={handleChange}
                      required
                      margin="normal"
                      variant="outlined"
                    >
                      <MenuItem value="">Typ elementu</MenuItem>
                      <MenuItem value="nakrycie głowy">Nakrycie Głowy</MenuItem>
                      <MenuItem value="koszula">Koszula</MenuItem>
                      <MenuItem value="spodnie">Spodnie</MenuItem>
                      <MenuItem value="kamizelka">Kamizelka</MenuItem>
                      <MenuItem value="buty">Buty</MenuItem>
                      <MenuItem value="akcesoria">Akcesoria</MenuItem>
                      <MenuItem value="bizuteria">Biżuteria</MenuItem>
                      <MenuItem value="halka">Halka</MenuItem>
                      <MenuItem value="sukienka">Sukienka</MenuItem>
                    </TextField>

                    <div className={classes.fileInputWrapper}>
                      <input
                        accept="image/*"
                        id="image-upload"
                        type="file"
                        name="image"
                        onChange={handleChange}
                        className={classes.hiddenInput}
                      />
                      <label htmlFor="image-upload">
                        <Button variant="contained" component="span" className={classes.fileButton}>
                          DODAJ ZDJĘCIE
                        </Button>
                        {formData.image && (
                          <Typography
                            variant="body2"
                            style={{
                              marginLeft: 15,
                              maxWidth: '70%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formData.image.name}
                          </Typography>
                        )}
                      </label>
                    </div>
                  </>
                )}

                <div style={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={submitting}
                    className={classes.submitButton}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : addingOutfit ? 'Poproś o dodanie stroju' : 'Poproś o dodanie elementu'}
                  </Button>
                </div>
              </form>
            </Paper>
          </div>

          <div className={classes.listWrapper}>
            <Typography variant="h5" gutterBottom>
              Twoje stroje
            </Typography>
            {renderItems('Stroje', stroje)}

            <Typography variant="h5" style={{ marginTop: 20 }} gutterBottom>
              Twoje elementy stroju
            </Typography>
            {renderItems('Elementy stroju', elementStroje)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPage;
