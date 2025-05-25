from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Costume, Element, Rental

User = get_user_model()

def create_user(email='test@example.com', password='password123'):
    """Tworzenie użytkownika"""
    return User.objects.create_user(email=email, password=password, name='Test User', is_renter = True)

def create_costume(name='Test Stroj', user=None):
    """Tworzenie stroju"""
    if user is None:
        user = create_user(email='another@example.com')
    return Costume.objects.create(name=name, gender='male', user=user)

def create_element(name='Element 1', user=None):
    """Tworzenie elementu stroju"""
    if user is None:
        user = create_user(email='another@example.com')
    return Element.objects.create(name=name, user=user)

class RentalApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)
        self.costume = create_costume(user=self.user)
        self.element = create_element(user=self.user)
        self.url_create = reverse('rental-create')
        self.url_list = reverse('rental-list')

    def test_create_rental_with_costume(self):
        """Tworzenie wypożyczenia na podstawie prawidłowych danych ze strojem"""
        payload = {
            'costume': self.costume.id,
            'rented': datetime.now().isoformat(),
            'return_date': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rental.objects.count(), 1)
        rental = Rental.objects.first()
        self.assertEqual(rental.user, self.user)
        self.assertEqual(rental.costume, self.costume)

    def test_create_rental_with_element(self):
        """Tworzenie wypożyczenia na podstawie prawidłowych danych z elmentem"""
        payload = {
            'element': self.element.id,
            'rented': datetime.now().isoformat(),
            'return_date': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rental.objects.count(), 1)
        self.assertEqual(Rental.objects.first().element, self.element)

    def test_list_rental(self):
        """Pobranie listy wypożyczeń"""
        Rental.objects.create(
            user=self.user,
            costume=self.costume,
            rented=datetime.now(),
            return_date=datetime.now() + timedelta(days=3)
        )
        res = self.client.get(self.url_list)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_retrieve_rental(self):
        """Test pobrania szczegółów konkrentego wypożyczenia"""
        wyp = Rental.objects.create(
            user=self.user,
            costume=self.costume,
            rented=datetime.now(),
            return_date=datetime.now() + timedelta(days=3)
        )
        url = reverse('rental-detail', args=[wyp.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], wyp.id)

    def test_update_rental(self):
        """Zmiana danych wypożyczenia"""
        rental = Rental.objects.create(
            user=self.user,
            costume=self.costume,
            rented=datetime.now(),
            return_date=datetime.now() + timedelta(days=3)
        )
        url = reverse('rental-update', args=[rental.id])
        new_return_date = datetime.now() + timedelta(days=10)
        res = self.client.patch(url, {'return_date': new_return_date.isoformat()}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        rental.refresh_from_db()
        self.assertEqual(rental.return_date.date(), new_return_date.date())

    def test_delete_rental(self):
        """Usunięcie wypozyczenia"""
        rental = Rental.objects.create(
            user=self.user,
            costume=self.costume,
            rented=datetime.now(),
            return_date=datetime.now() + timedelta(days=3)
        )
        url = reverse('rental-delete', args=[rental.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Rental.objects.filter(id=rental.id).exists())
