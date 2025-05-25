from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import News

User = get_user_model()

# Define endpoint URLs
CREATE_URL = reverse('news-create')
LIST_URL = reverse('news-list')


class TestNewsApi(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            name='Test User'
        )
        self.client.force_authenticate(user=self.user)

        self.news = News.objects.create(
            name='Initial News',
            text='This is a test news item.'
        )

    def test_create_news(self):
        """Tworzenie wiadomości"""
        payload = {
            'name': 'New News',
            'text': 'This is a newly created news item.'
        }
        res = self.client.post(CREATE_URL, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(News.objects.count(), 2)
        self.assertEqual(News.objects.last().name, payload['name'])
        self.assertEqual(News.objects.last().text, payload['text'])

    def test_list_news(self):
        """Pobieranie listy wiadomości"""
        res = self.client.get(LIST_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)
        self.assertGreaterEqual(len(res.data), 1)
        self.assertIn('name', res.data[0])
        self.assertIn('text', res.data[0])
        self.assertIn('id', res.data[0])

    def test_retrieve_news(self):
        """Pobieranie konkretnej wiadomości"""
        url = reverse('news-detail', args=[self.news.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], self.news.id)
        self.assertEqual(res.data['name'], self.news.name)
        self.assertEqual(res.data['text'], self.news.text)

    def test_update_news(self):
        """Aktualizacja wiadomości"""
        url = reverse('news-update', args=[self.news.id])
        payload = {'name': 'Updated News', 'text': 'Updated news content.'}
        res = self.client.patch(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.news.refresh_from_db()
        self.assertEqual(self.news.name, payload['name'])
        self.assertEqual(self.news.text, payload['text'])

    def test_delete_news(self):
        """Usuwanie wiadomości"""
        url = reverse('news-delete', args=[self.news.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(News.objects.filter(id=self.news.id).exists())
