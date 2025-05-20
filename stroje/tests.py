from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import ElementStroju, Stroj

User = get_user_model()

def create_user(email='test@example.com', password='password123'):
    return User.objects.create_user(email=email, password=password, name='Test User')

class ElementStrojuApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_create_element_stroju(self):
            url = reverse('element-create')
            valid_gender = ElementStroju.GENDERS[0][0]
            valid_size = ElementStroju.SIZE_CATEGORIES[0][0]
            valid_type = ElementStroju.ELEMENT_TYPES[1][0]

            payload = {
                'name': 'Koszula Testowa',
                'description': 'Biała koszula do testów',
                'gender': valid_gender,
                'size': valid_size,
                'element_type': valid_type,
                'city': 'Poznań',
                'user': self.user.id
            }

            response = self.client.post(url, payload, format='json')

            self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Unexpected response: {response.data}")

            self.assertTrue(ElementStroju.objects.filter(name='Koszula Testowa').exists(), "ElementStroju not found in DB")
            created = ElementStroju.objects.get(name='Koszula Testowa')

            self.assertEqual(created.gender, valid_gender)
            self.assertEqual(created.size, valid_size)
            self.assertEqual(created.element_type, valid_type)
            self.assertEqual(created.user, self.user)

    def test_list_element_stroju(self):
        ElementStroju.objects.create(
            name='Krawat',
            user=self.user,
            gender='M',
            size='M',
            element_type='krawat'
        )
        url = reverse('element-list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_retrieve_element_stroju(self):
        element = ElementStroju.objects.create(
            name='Kapelusz',
            user=self.user,
            gender='M',
            size='L',
            element_type='kapelusz'
        )
        url = reverse('element-detail', args=[element.id])
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], element.id)

    def test_update_element_stroju(self):
        element = ElementStroju.objects.create(
            name='Płaszcz',
            user=self.user,
            gender='M',
            size='XL',
            element_type='płaszcz'
        )
        url = reverse('element-update', args=[element.id])
        payload = {'name': 'Nowy Płaszcz'}
        res = self.client.patch(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        element.refresh_from_db()
        self.assertEqual(element.name, 'Nowy Płaszcz')

    def test_delete_element_stroju(self):
        element = ElementStroju.objects.create(
            name='Buty',
            user=self.user,
            gender='M',
            size='42',
            element_type='buty'
        )
        url = reverse('element-delete', args=[element.id])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ElementStroju.objects.filter(id=element.id).exists())

class StrojApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)


        self.koszula = ElementStroju.objects.create(
            name="Koszula Biała",
            description="Opis",
            gender="meski",
            size="M",
            element_type="koszula",
            city="Warszawa",
            user=self.user
        )

    def test_create_stroj_successfully(self):
        """Test creating a Stroj with valid data and assigned koszula"""
        url = reverse('create-stroj')
        payload = {
            'name': 'Stroj Meski',
            'description': 'Opis testowy',
            'city': 'Kraków',
            'size': 'M',
            'gender': 'meski',
            'user': self.user.id,
            'koszula': self.koszula.id
        }

        response = self.client.post(url, payload, format='json')
        print("Response:", response.status_code, response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Stroj.objects.filter(name='Stroj Meski').exists())

        stroj = Stroj.objects.get(name='Stroj Meski')
        self.assertEqual(stroj.koszula, self.koszula)
        self.assertEqual(stroj.gender, 'meski')
        self.assertEqual(stroj.user, self.user)

    def test_create_stroj_duplicate_element_assignment(self):
        """Test that assigning same koszula to multiple stroje fails"""
        Stroj.objects.create(
            name='Pierwszy',
            description='Opis',
            city='Gdansk',
            size='M',
            gender='meski',
            user=self.user,
            koszula=self.koszula
        )

        url = reverse('create-stroj')
        payload = {
            'name': 'Drugi',
            'description': 'Kopia stroju',
            'city': 'Lodz',
            'size': 'M',
            'gender': 'meski',
            'user': self.user.id,
            'koszula': self.koszula.id
        }

        response = self.client.post(url, payload, format='json')
        print("Validation response:", response.data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_stroj_invalid_gender(self):
        """Test error on invalid gender"""
        url = reverse('create-stroj')
        payload = {
            'name': 'Zly Stroj',
            'description': 'Test',
            'city': 'Wrocław',
            'size': 'M',
            'gender': 'alien',
            'user': self.user.id
        }

        response = self.client.post(url, payload, format='json')
        print("Invalid gender response:", response.data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('gender', response.data)

    def test_create_stroj_missing_required_fields(self):
        """Test creation fails when required fields are missing"""
        url = reverse('create-stroj')
        payload = {
            'name': '',
            'gender': 'meski',
            'user': self.user.id
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertIn('city', response.data)
        self.assertIn('size', response.data)