from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Costume, Element

#Pobranie klasy modelu Użytkownika
User = get_user_model()

def create_user(email='test@example.com', password='Password123!'):
    """Tworzenie użytkownika"""
    return User.objects.create_user(email=email, password=password, name='Test User', is_renter = True)

class ElementApiTests(TestCase):
    """Testy elementu stroju"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_create_element(self):
        """Test tworzenia elementu stroju"""
        url = reverse('element-create')
        valid_gender = Element.GENDERS[0][0]
        valid_size = Element.SIZE_CATEGORIES[0][0]
        valid_type = Element.ELEMENT_TYPES[1][0]
        payload = {
            'name': 'Shirt Test',
            'description': 'White shirt for tests',
            'gender': valid_gender,
            'size': valid_size,
            'element_type': valid_type,
            'city': 'Poznań',
            'user': self.user.id
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Unexpected response: {response.data}")
        self.assertTrue(Element.objects.filter(name='Shirt Test').exists(), "Element not found in DB")
        created = Element.objects.get(name='Shirt Test')
        self.assertEqual(created.gender, valid_gender)
        self.assertEqual(created.size, valid_size)
        self.assertEqual(created.element_type, valid_type)
        self.assertEqual(created.user, self.user)

    def test_list_element(self):
        """Test pobrania danych elementu"""
        Element.objects.create(
            name='headwear',
            user=self.user,
            gender='M',
            size='M',
            element_type='headwear'
        )
        url = reverse('element-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_retrieve_element(self):
        """Pozyskiwanie danych konkretnego elementu"""
        element = Element.objects.create(
            name='shirt',
            user=self.user,
            gender='M',
            size='L',
            element_type='shirt'
        )
        url = reverse('element-detail', args=[element.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], element.id)

    def test_update_element(self):
        """Zmiana danych elementu"""
        element = Element.objects.create(
            name='trousers',
            user=self.user,
            gender='M',
            size='XL',
            element_type='trousers'
        )
        url = reverse('element-update', args=[element.id])
        payload = {'name': 'New Trousers'}
        res = self.client.patch(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        element.refresh_from_db()
        self.assertEqual(element.name, 'New Trousers')

    def test_delete_element(self):
        """Usunięcie elementu stroju"""
        element = Element.objects.create(
            name='Shoes',
            user=self.user,
            gender='M',
            size='42',
            element_type='shoes'
        )
        url = reverse('element-delete', args=[element.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Element.objects.filter(id=element.id).exists())

class CostumeApiTests(TestCase):
    """Testy stroju"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)

        self.shirt = Element.objects.create(
            name="White Shirt",
            description="Test shirt",
            gender="male",
            size="M",
            element_type="shirt",
            city="Warsaw",
            user=self.user
        )

    def test_create_costume_successfully(self):
        """Tworzenie stroju na podstawie prawidłowych danych"""
        url = reverse('create-costume')
        payload = {
            'name': 'Male Costume',
            'description': 'Test description',
            'city': 'Kraków',
            'size': 'M',
            'gender': 'male',
            'user': self.user.id,
            'shirt': self.shirt.id
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Costume.objects.filter(name='Male Costume').exists())
        costume = Costume.objects.get(name='Male Costume')
        self.assertEqual(costume.shirt, self.shirt)
        self.assertEqual(costume.gender, 'male')
        self.assertEqual(costume.user, self.user)

    def test_create_costume_duplicate(self):
        """Tworzenie dwóch strojów dla tego samego elementu"""
        Costume.objects.create(
            name='First Costume',
            description='Desc',
            city='Gdańsk',
            size='M',
            gender='male',
            user=self.user,
            shirt=self.shirt
        )
        url = reverse('create-costume')
        payload = {
            'name': 'Second Costume',
            'description': 'Copy of first',
            'city': 'Łódź',
            'size': 'M',
            'gender': 'male',
            'user': self.user.id,
            'shirt': self.shirt.id
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_costume_invalid_gender(self):
        """Tworzenie stroju z błędnymi danymi"""
        url = reverse('create-costume')
        payload = {
            'name': 'Invalid Gender Costume',
            'description': 'Test',
            'city': 'Wrocław',
            'size': 'M',
            'gender': 'alien',
            'user': self.user.id
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('gender', response.data)

    def test_create_costume_missing_required_fields(self):
        """Tworzenie stroju bez podania wymaganych danych"""
        url = reverse('create-costume')
        payload = {
            'name': '',
            'gender': 'male',
            'user': self.user.id
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertIn('city', response.data)
        self.assertIn('size', response.data)
