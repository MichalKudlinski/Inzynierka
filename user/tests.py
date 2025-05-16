from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

CREATE_USER_URL = reverse('user:create')
TOKEN_URL = reverse('user:token')
ME_URL = reverse('user:me')


def create_user(**params):
    return User.objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Test API that doesn't require auth"""

    def setUp(self):
        self.client = APIClient()

    def test_create_valid_user_success(self):
        payload = {
            'email': 'test@example.com',
            'password': 'strongpass123',
            'name': 'Test User',
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)

    def test_user_exists(self):
        payload = {'email': 'test@example.com', 'password': 'testpass', 'name': 'Test'}
        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short(self):
        payload = {'email': 'test@example.com', 'password': '123', 'name': 'Test'}
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(email=payload['email']).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        payload = {
            'name': 'Test',
            'email': 'test@example.com',
            'password': 'testpass123!',
        }

        create_user(
            email=payload['email'],
            password=payload['password'],
            name=payload['name']
        )


        res = self.client.post(TOKEN_URL, {
            'name': payload['name'],
            'password': payload['password']
        })


        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
            msg=f"Expected 200 OK, got {res.status_code} with response: {res.data}"
        )

        self.assertIn(
            'token',
            res.data,
            msg=f"'token' not in response data. Response: {res.data}"
        )

    def test_create_token_invalid_credentials(self):
        create_user(email='test@example.com', password='goodpass', name='Test')
        payload = {'name': 'test@example.com', 'password': 'wrongpass'}
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_token_no_user(self):
        payload = {'name': 'nouser@example.com', 'password': 'pass123'}
        res = self.client.post(TOKEN_URL, payload)
        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_unauthorized(self):
        res = self.client.get(ME_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTests(TestCase):
    """Test API that requires auth"""

    def setUp(self):
        self.user = create_user(
            email='user@example.com',
            password='testpass123',
            name='Test Name'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        res = self.client.get(ME_URL)

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
            f"Expected 200 OK, got {res.status_code} with response: {res.data}"
        )

        self.assertIn('email', res.data, "Response data missing 'email' field")
        self.assertIn('name', res.data, "Response data missing 'name' field")

        self.assertEqual(
            res.data['email'],
            self.user.email,
            f"Expected email '{self.user.email}', got '{res.data.get('email')}'"
        )

        self.assertEqual(
            res.data['name'],
            self.user.name,
            f"Expected name '{self.user.name}', got '{res.data.get('name')}'"
        )

    def test_post_me_not_allowed(self):
        res = self.client.post(ME_URL, {})
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        payload = {'name': 'New Name', 'password': 'newpass123'}
        res = self.client.patch(ME_URL, payload)

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
            f"Expected status 200 OK, got {res.status_code} with response: {res.data}"
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.name,
            payload['name'],
            f"Expected user name to be updated to '{payload['name']}', got '{self.user.name}'"
        )

        self.assertTrue(
            self.user.check_password(payload['password']),
            "Password update failed — the new password does not match"
         )