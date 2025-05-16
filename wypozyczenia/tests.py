from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import ElementStroju, Stroj, Wypozyczenie

User = get_user_model()

def create_user(email='test@example.com', password='password123'):
    return User.objects.create_user(email=email, password=password, name='Test User')

def create_stroj(name='Test Stroj', user=None):
    if user is None:
        user = create_user(email='another@example.com')
    return Stroj.objects.create(name=name, gender='M', user=user)

def create_element_stroju(name='Element 1', user=None):
    if user is None:
        user = create_user(email='another@example.com')
    return ElementStroju.objects.create(name=name, user=user)

class WypozyczenieApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)
        self.stroj = create_stroj(user=self.user)
        self.element = create_element_stroju(user=self.user)
        self.url_create = reverse('wypozyczenie-create')
        self.url_list = reverse('wypozyczenie-list')

    def test_create_wypozyczenie_with_stroj(self):
        """Test creating a wypozyczenie with a stroj"""
        payload = {
            'stroj': self.stroj.id,
            'wypozyczono': datetime.now().isoformat(),
            'zwrot': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wypozyczenie.objects.count(), 1)
        wyp = Wypozyczenie.objects.first()
        self.assertEqual(wyp.user, self.user)
        self.assertEqual(wyp.stroj, self.stroj)

    def test_create_wypozyczenie_with_element_stroju(self):
        """Test creating a wypozyczenie with an element_stroju"""
        payload = {
            'element_stroju': self.element.id,
            'wypozyczono': datetime.now().isoformat(),
            'zwrot': (datetime.now() + timedelta(days=5)).isoformat(),
        }
        res = self.client.post(self.url_create, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wypozyczenie.objects.count(), 1)
        self.assertEqual(Wypozyczenie.objects.first().element_stroju, self.element)

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
        url = reverse('wypozyczenie-detail', args=[wyp.id])
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
        url = reverse('wypozyczenie-update', args=[wyp.id])
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
        url = reverse('wypozyczenie-delete', args=[wyp.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Wypozyczenie.objects.filter(id=wyp.id).exists())
