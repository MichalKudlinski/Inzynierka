from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

#Pobranie modelu User do zmiennej
User = get_user_model()

#Pozyskiwanie url poszczególnych endpointów na podstawie danych w pliku urls.py
#/api/user/create
CREATE_USER_URL = reverse('user:create')
#/api/user/token
TOKEN_URL = reverse('user:token')
#/api/user/me
ME_URL = reverse('user:me')

#Tworzenie instancji użytkownika
def create_user(**params):
    return User.objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Testowanie API bez autoryzacji"""

    def setUp(self):
        self.client = APIClient()

    def test_create_valid_user_success(self):
        """Test tworzenia użytkownika z prawidłowymi danymi"""
        payload = {
            'email': 'test@example.com',
            'password': 'strongpass123',
            'name': 'Test User',
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))


    def test_user_exists(self):
        """Test tworzenia użytkownika z powtarzającym się adresem e-mail"""
        payload = {'email': 'test@example.com', 'password': 'testpass', 'name': 'Test'}
        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short(self):
        """Test stworzenia użytkownika z hasłem nie spełniającym kryteriów walidacji"""
        payload = {'email': 'test@example.com', 'password': '123', 'name': 'Test'}
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(email=payload['email']).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        """Test pozyskiwania tokenu autoryzacji na podstawie danych użytkownika"""
        payload = {'name': 'Test','email': 'test@example.com', 'password': 'testpass123!'}
        create_user( email=payload['email'], password=payload['password'], name=payload['name'])
        res = self.client.post(TOKEN_URL, {'name': payload['name'], 'password': payload['password']})
        self.assertEqual(res.status_code, status.HTTP_200_OK, msg=f"Expected 200 OK, got {res.status_code} with response: {res.data}")
        self.assertIn('token', res.data, msg=f"'token' not in response data. Response: {res.data}")

    def test_create_token_invalid_credentials(self):
        """Test pozyskiwania tokenu autoryzacji dla użytkownika utworzonego na podstawie błędnych danych"""
        create_user(email='test@example.com', password='goodpass', name='Test')
        payload = {'name': 'test@example.com', 'password': 'wrongpass'}
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


    def test_retrieve_user_unauthorized(self):
        """Test pozyskiwania danych użytkownika bez podania tokenu autoryzacji"""
        res = self.client.get(ME_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTests(TestCase):
    """Testowanie API z autoryzacją"""

    def setUp(self):
        self.user = create_user(
            email='user@example.com',
            password='testpass123',
            name='Test Name'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """Pozyskiwanie danych użytkownika z prawidłową autoryzacją"""
        res = self.client.get(ME_URL)
        self.assertEqual( res.status_code, status.HTTP_200_OK, f"Expected 200 OK, got {res.status_code} with response: {res.data}")
        self.assertIn('email', res.data, "Response data missing 'email' field")
        self.assertIn('name', res.data, "Response data missing 'name' field")
        self.assertEqual( res.data['email'], self.user.email, f"Expected email '{self.user.email}', got '{res.data.get('email')}'")
        self.assertEqual( res.data['name'], self.user.name, f"Expected name '{self.user.name}', got '{res.data.get('name')}'")


    def test_update_user_profile(self):
        """Zmiana danych użytkownika, z prawidłową autoryzacją"""
        payload = {'name': 'New Name', 'password': 'newpass123'}
        res = self.client.patch(ME_URL, payload)
        self.assertEqual( res.status_code, status.HTTP_200_OK, f"Expected status 200 OK, got {res.status_code} with response: {res.data}")
        self.user.refresh_from_db()
        self.assertEqual( self.user.name, payload['name'], f"Expected user name to be updated to '{payload['name']}', got '{self.user.name}'")
        self.assertTrue( self.user.check_password(payload['password']), "Password update failed — the new password does not match")