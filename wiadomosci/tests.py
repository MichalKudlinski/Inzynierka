from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import News

CREATE_URL = reverse('wiadomosc-create')
LIST_URL = reverse('wiadomosc-list')

class TestWiadomosciAPI(APITestCase):

    def setUp(self):
        self.wiadomosc = News.objects.create(
            name='Test User',
            text='This is a test message.'
        )

    def test_create_wiadomosc(self):
        payload = {
            'name': 'John Doe',
            'text': 'Hello, this is a message.'
        }
        res = self.client.post(CREATE_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(News.objects.count(), 2)
        self.assertEqual(News.objects.last().name, payload['name'])

    def test_list_wiadomosci(self):
        res = self.client.get(LIST_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)
        self.assertGreaterEqual(len(res.data), 1)
        self.assertIn('name', res.data[0])
        self.assertIn('text', res.data[0])

    def test_retrieve_wiadomosc(self):
        url = reverse('wiadomosc-detail', args=[self.wiadomosc.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], self.wiadomosc.id)
        self.assertEqual(res.data['name'], self.wiadomosc.name)

    def test_update_wiadomosc(self):
        url = reverse('wiadomosc-update', args=[self.wiadomosc.id])
        payload = {'name': 'Updated Name', 'text': 'Updated message.'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.wiadomosc.refresh_from_db()
        self.assertEqual(self.wiadomosc.name, payload['name'])
        self.assertEqual(self.wiadomosc.text, payload['text'])

    def test_delete_wiadomosc(self):
        url = reverse('wiadomosc-delete', args=[self.wiadomosc.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(News.objects.filter(id=self.wiadomosc.id).exists())