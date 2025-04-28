import logging

from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        PermissionsMixin)
from django.core.mail import send_mail
from django.db import models

"""
Klasy w bazie danych
"""

# Klasa menadzer uzytkownikow

class UserManager(BaseUserManager):

    def create_user(self, email, name, password=None, **extra_field):
        """Create regular user"""
        if not email:
            raise ValueError("The email field is required.")
        if not name:
            raise ValueError("User must have a name")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_field)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        """Create a superuser"""
        user = self.create_user(email=email, name=name, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user



# Klasa Uzytkownik
class User(AbstractBaseUser, PermissionsMixin):
        email = models.EmailField(max_length=255, unique=True, null=False, blank=False)
        name = models.CharField(max_length=255, unique = True)
        is_active = models.BooleanField(default = True)
        is_staff = models.BooleanField(default = False)
        is_renter = models.BooleanField(default = False)
        phone_number = models.CharField(max_length=15, blank=True, null=True)

        objects = UserManager()

        USERNAME_FIELD = 'name'
        REQUIRED_FIELDS = ['email']
        def save(self, *args, **kwargs):
            is_new = self.pk is None
            super().save(*args, **kwargs)
            if  self.is_renter and is_new:
                subject = "Dziękujemy za rejestrację!"
                message = "Dzień dobry, dziekujemy za rejestrację w naszym serwisie." \
                "Instrukcja dodawania swoich strojów, umożliwiając tym samym ich wypożyczenie innym użytkownikom:" \
                "1. W szablonie pliku excel znajdującym się w załączniku proszę wypełnić dane na temat strojów" \
                "2. Wypełniony plik excel proszę o odesłanie na mail: heritage_wear@gmail.com wraz zdjęciami poszczególnych" \
                "czesci garderoby, nazwy plików zdjęć powinny odpowiadać nazwom produktów zawartym w pliku excel."
                from_email = "kudlinski.test@gmail.com"
                recipient_list = ['michal.kudlinski@gmail.com']

                try:
                    send_mail(subject, message, from_email, recipient_list)
                    print(f"Email sent to {self.email}")
                except Exception as e:
                    print(f"Error sending email to {self.email}: {e}")



class ElementStroju(models.Model):
    id  = models.BigAutoField(primary_key  = True)

    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable = False)


    name = models.CharField(max_length= 255)

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    city = models.CharField(max_length=255)

    description = models.TextField(blank=True)

    ELEMENT_TYPES = [
        ('nakrycie głowy', 'Nakrycie Głowy'),
        ('koszula', 'Koszula'),
        ('spodnie', 'Spodnie'),
        ('kamizelka', 'Kamizelka'),
        ('buty', 'Buty'),
        ('akcesoria', 'Akcesoria'),
        ('bizuteria','Bizuteria'),
        ('halka', 'Halka'),
        ('sukienka', 'Sukienka'),
    ]

    GENDERS = [
        ('meski', 'Meski'),
        ('damski','Damski'),    ]

    SIZE_CATEGORIES= [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),    ]

    gender = models.CharField(
        max_length = 10,
        choices = GENDERS,
    )
    size = models.CharField(
         max_length = 50,
        choices = SIZE_CATEGORIES)
    element_type = models.CharField(
        max_length = 50,
        choices = ELEMENT_TYPES)

    image = models.ImageField(upload_to='uploads/images/', blank=True, null=True)

    def __str__(self):
        return f"{self.name}"



class Stroj(models.Model):

    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable=False)


    name = models.CharField(max_length=255)


    description = models.TextField(blank=True)

    city = models.CharField(max_length=255)

    image = models.ImageField(upload_to='uploads/images/', blank=True, null=True)
    GENDERS = [
        ('meski', 'Meski'),
        ('damski', 'Damski'),
        ('unisex', 'Unisex'),
    ]

    gender = models.CharField(
        max_length=10,
        choices=GENDERS,
    )
    SIZE_CATEGORIES= [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),   ]

    size = models.CharField(
         max_length = 50,
        choices = SIZE_CATEGORIES)
    nakrycie_glowy = models.ForeignKey('ElementStroju', related_name='nakrycie_glowy', on_delete=models.CASCADE, blank=True, null=True)
    koszula = models.ForeignKey('ElementStroju', related_name='koszula', on_delete=models.CASCADE, blank=True, null=True)
    spodnie = models.ForeignKey('ElementStroju', related_name='spodnie', on_delete=models.CASCADE, blank=True, null=True)
    kamizelka = models.ForeignKey('ElementStroju', related_name='kamizelka', on_delete=models.CASCADE, blank=True, null=True)
    buty = models.ForeignKey('ElementStroju', related_name='buty', on_delete=models.CASCADE, blank=True, null=True)
    akcesoria = models.ForeignKey('ElementStroju', related_name='akcesoria', on_delete=models.CASCADE, blank=True, null=True)
    bizuteria = models.ForeignKey('ElementStroju', related_name='bizuteria', on_delete=models.CASCADE, blank=True, null=True)
    halka = models.ForeignKey('ElementStroju', related_name='halka', on_delete=models.CASCADE, blank=True, null=True)
    sukienka = models.ForeignKey('ElementStroju', related_name='sukienka', on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return f"Stroj: {self.name}"


class Wypozyczenie(models.Model):
    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    element_stroju = models.ForeignKey('ElementStroju', on_delete=models.CASCADE, blank=True, null=True)
    stroj = models.ForeignKey('Stroj', on_delete=models.CASCADE, blank=True, null=True)

    wypozyczono = models.DateTimeField(auto_now_add=True)
    zwrot = models.DateTimeField(blank=True, null=True)
    rezerwacja = models.BooleanField(default=False)  # Czy rezerwacja

    def __str__(self):
        return f"Wypozyczenie: {self.id} "

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        print(f"Saving Wypozyczenie instance: is_new={is_new}, ID={self.id}")

        try:
                # Call the superclass save method
            super().save(*args, **kwargs)
            print(f"Wypozyczenie instance saved successfully: ID={self.id}")

            # Check if it's a new instance
            if is_new:

                user_phone_number = None
                city = None

                if self.stroj and self.stroj.user:
                    user_phone_number = self.stroj.user.phone_number
                    city = self.stroj.city
                elif self.element_stroju and self.element_stroju.user:
                    city = self.element_stroju.city
                    user_phone_number = self.element_stroju.user.phone_number
                wypozyczono = self.wypozyczono.strftime('%d-%m-%Y') if self.wypozyczono else 'Brak daty'
                zwrot = self.zwrot.strftime('%d-%m-%Y') if self.zwrot else 'Brak daty'
                # Construct the email body
                name = self.element_stroju.name if self.element_stroju else self.stroj_name
                if not self.rezerwacja:  # Only modify the email body if reservation is False

                    message = f"""Dzień dobry,
                                  Ten email jest potwierdzeniem wypożyczenia : {name}.
                                  Data rozpoczęcia wypożyczenia: {wypozyczono}
                                  Data zwrotu: {zwrot}
                                  Miasto właściciela: {city}
                                  Sposób przekazania stroju i warunki jego wypożyczenia proszę ustalić
                                  bezpośrednio z właścicielem stroju / elementu stroju.
                                  Numer właściciela: {user_phone_number if user_phone_number else 'Brak numeru telefonu właściciela'}
                                  Pozdrawiamy,
                                  HeritageWear
                                """
                else:
                    essage = f"""Dzień dobry,
                                  Ten email jest potwierdzeniem rezerwacji : {name}.
                                  Data rozpoczęcia rezerwacji: {wypozyczono}
                                  Data końca rezerwacji: {zwrot}
                                  Miasto właściciela: {city}
                                  Ma Pan/ Pani 7 dni na potwierdzenie drogą mailową chęci wypożyczenia stroju w podanym w rezerwacji terminie.
                                  W tytule maila proszę podać numer rezerwacji a w treści napisać Imię Naziwsko i Potwierdzam.
                                  Pozdrawiamy,
                                  HeritageWear
                                """
                # Send confirmation email
                send_mail(
                    subject="Potwierdzenie Wypożyczenia",
                    message=message,
                    from_email="kudlinski.test@gmail.com",
                    recipient_list=['michal.kudlinski@gmail.com'],  # This can be updated as needed
                    fail_silently=False,
                )
                print(f"Email sent successfully for Wypozyczenie ID={self.id}")
        except Exception as e:
            print(f"Error occurred while saving Wypozyczenie ID={self.id}: {e}")


class Image(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='uploads/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name

    def image_url(self):
        return self.image.url


class Wiadomosci(models.Model):
    name = models.CharField(max_length=100)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

