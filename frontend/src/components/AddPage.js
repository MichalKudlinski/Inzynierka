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
    width: 350,
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderRadius: 20,
    border: '3px solid #d4a373',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    maxHeight: '80vh',
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

const elementTypeMapping = {
  nakrycie_glowy: 'nakrycie głowy',
  koszula: 'koszula',
  spodnie: 'spodnie',
  kamizelka: 'kamizelka',
  buty: 'buty',
  akcesoria: 'akcesoria',
  bizuteria: 'bizuteria',
  halka: 'halka',
  sukienka: 'sukienka',
};

const AddPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const [stroje, setStroje] = useState([]);
  const [elementStroje, setElementStroje] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [addingOutfit, setAddingOutfit] = useState(false);

  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchUserAndItems = async () => {
    setLoading(true);
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
        setFormData(initialFormData);
        await fetchUserAndItems();

      } else {
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== null &&
            ![
              'nakrycie_glowy',
              'koszula',
              'spodnie',
              'kamizelka',
              'buty',
              'akcesoria',
              'bizuteria',
              'halka',
              'sukienka',
            ].includes(key)
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
        setFormData(initialFormData);
        await fetchUserAndItems();
      }
    } catch (err) {
      console.error('Error submitting form:', err);

      let message = 'Błąd przy dodawaniu elementu/stroju.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (typeof parsed === 'object') {
            const messages = Object.values(parsed)
              .flat()
              .join('\n');
            message = messages;
          }
        } catch {
          message = err.message;
        }
      }

      alert(`Nie udało się dodać elementu/stroju:\n${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Updated render function for items (costumes or elements)
  const renderItems = (title, items) => {
    const isElement = title.toLowerCase().includes('element');

    if (items.length === 0) {
      return (
        <Typography variant="body1" style={{ textAlign: 'center' }}>
          Brak {title.toLowerCase()}
        </Typography>
      );
    }

    return items.map((item) => {
      const isApproved = item.confirmed === true;

      const cardStyle = {
        marginBottom: 15,
        backgroundColor: isApproved ? '#e6ffe6' : '#f0f0f0',
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
                style={{ color: '#999', fontStyle: 'italic', marginBottom: 10 }}
              >
                Oczekiwanie na zatwierdzenie
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: 10, marginRight: 10 }}
              onClick={() =>
                navigate(`/details/${isElement ? 'element' : 'stroj'}/${item.id}`)
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
                openDeleteConfirmation({ ...item, type: isElement ? 'element' : 'costume' })
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
    // Implement your delete confirmation dialog logic here
    // For now, just confirm and delete:
    if (window.confirm(`Czy na pewno chcesz usunąć ${item.name}?`)) {
      deleteItem(item);
    }
  };

  const deleteItem = async (item) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `/api/costumes/${item.type === 'element' ? 'element' : 'costume'}/delete/${item.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Token ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error('Błąd usuwania elementu/stroju');
      }
      alert(`${item.name} został usunięty.`);
      await fetchUserAndItems();
    } catch (err) {
      alert(`Nie udało się usunąć: ${err.message}`);
    }
  };

  return (
    <div className={classes.root}>
      <Button className={classes.backButton} onClick={() => navigate('/')}>
        Powrót
      </Button>
      <div className={classes.container}>
        <div className={classes.formWrapper}>
          <Paper className={classes.paper} elevation={3}>
            <Typography variant="h5" gutterBottom>
              {addingOutfit ? 'Dodaj strój' : 'Dodaj element stroju'}
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
                    label="Płeć"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <MenuItem value="kobieta">Kobieta</MenuItem>
                    <MenuItem value="mężczyzna">Mężczyzna</MenuItem>
                    <MenuItem value="inne">Inne</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Rozmiar"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Typ elementu stroju"
                    name="element_type"
                    value={formData.element_type}
                    onChange={handleChange}
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    {Object.values(elementTypeMapping).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {addingOutfit && (
                <>
                  <TextField
                    select
                    label="Płeć"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <MenuItem value="kobieta">Kobieta</MenuItem>
                    <MenuItem value="mężczyzna">Mężczyzna</MenuItem>
                    <MenuItem value="inne">Inne</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Rozmiar"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                  </TextField>

                  {Object.keys(elementTypeMapping).map((key) => (
                    <TextField
                      key={key}
                      select
                      label={elementTypeMapping[key]}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      fullWidth
                      className={classes.formControl}
                    >
                      <MenuItem value="">-- Wybierz --</MenuItem>
                      {elementStroje
                        .filter(
                          (el) =>
                            el.confirmed === true &&
                            el.element_type.toLowerCase().trim() ===
                            elementTypeMapping[key].toLowerCase().trim()
                        )
                        .map((el) => (
                          <MenuItem key={el.id} value={el.id}>
                            {el.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  ))}
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
                  <Button component="span" className={classes.fileButton}>
                    Wybierz zdjęcie
                  </Button>
                </label>
                {formData.image && <Typography style={{ marginLeft: 10 }}>{formData.image.name}</Typography>}
              </div>

              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                className={classes.submitButton}
              >
                {addingOutfit ? 'Dodaj strój' : 'Dodaj element'}
              </Button>
              <Button
                variant="text"
                onClick={() => setAddingOutfit((prev) => !prev)}
                style={{ marginTop: 12 }}
              >
                {addingOutfit ? 'Dodaj pojedynczy element' : 'Dodaj cały strój'}
              </Button>

              {errorMessage && (
                <Typography variant="body1" color="error" className={classes.errorText}>
                  {errorMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </div>
        <div className={classes.listWrapper}>
          <Typography variant="h6" style={{ marginBottom: 15 }}>
            Elementy stroju
          </Typography>
          {loading ? (
            <div className={classes.loadingWrapper}>
              <CircularProgress />
            </div>
          ) : (
            renderItems('Elementy stroju', elementStroje)
          )}
          <Typography variant="h6" style={{ marginTop: 30, marginBottom: 15 }}>
            Stroje
          </Typography>
          {loading ? (
            <div className={classes.loadingWrapper}>
              <CircularProgress />
            </div>
          ) : (
            renderItems('Stroje', stroje)
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPage;
