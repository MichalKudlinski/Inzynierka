from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import ElementStroju, Stroj, Wypozyczenie  # Adjust if needed

User = get_user_model()


def create_user(email='test@example.com', password='password123'):
    return User.objects.create_user(email=email, password=password, name='Test User')


def create_stroj(name='Test Stroj'):
    return Stroj.objects.create(name=name, gender='M')  # Adjust if more required fields


def create_element_stroju(name='Element 1'):
    return ElementStroju.objects.create(name=name)  # Add necessary fields


class WypozyczenieApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)  # If views require auth
        self.stroj = create_stroj()
        self.element = create_element_stroju()
        self.url_create = reverse('create-wypozyczenie')
        self.url_list = reverse('list')

    def test_create_wypozyczenie_with_stroj(self):
        """Test creating a wypozyczenie with a stroj"""




        payload = {
            'user': self.user.id,
            'stroj': self.stroj.id,
            'wypozyczono': datetime.now().isoformat(),
            'zwrot': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wypozyczenie.objects.count(), 1)

    def test_create_wypozyczenie_with_element_stroju(self):
        """Test creating a wypozyczenie with element stroju"""
        payload = {
            'user': self.user.id,
            'element_stroju': self.element.id,
            'wypozyczono': datetime.now().isoformat(),
            'zwrot': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_list_wypozyczenia(self):
        """Test listing wypozyczenia"""
        Wypozyczenie.objects.create(
            user=self.user,
            stroj=self.stroj,
            wypozyczono=datetime.now(),
            zwrot=datetime.now() + timedelta(days=3)
        )
        res = self.client.get(self.url_list)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_retrieve_wypozyczenie(self):
        """Test retrieving a single wypozyczenie"""
        wyp = Wypozyczenie.objects.create(
            user=self.user,
            stroj=self.stroj,
            wypozyczono=datetime.now(),
            zwrot=datetime.now() + timedelta(days=3)
        )
        url = reverse('retrieve-wypozyczenie', args=[wyp.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], wyp.id)

    def test_update_wypozyczenie(self):
        """Test updating a wypozyczenie"""
        wyp = Wypozyczenie.objects.create(
            user=self.user,
            stroj=self.stroj,
            wypozyczono=datetime.now(),
            zwrot=datetime.now() + timedelta(days=3)
        )
        url = reverse('update-wypozyczenie', args=[wyp.id])
        new_zwrot = datetime.now() + timedelta(days=10)
        res = self.client.patch(url, {'zwrot': new_zwrot.isoformat()}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        wyp.refresh_from_db()
        self.assertEqual(wyp.zwrot.date(), new_zwrot.date())

    def test_delete_wypozyczenie(self):
        """Test deleting a wypozyczenie"""
        wyp = Wypozyczenie.objects.create(
            user=self.user,
            stroj=self.stroj,
            wypozyczono=datetime.now(),
            zwrot=datetime.now() + timedelta(days=3)
        )
        url = reverse('delete-wypozyczenie', args=[wyp.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Wypozyczenie.objects.filter(id=wyp.id).exists())
