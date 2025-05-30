import io
import logging
import os
import smtplib
from email.message import EmailMessage
from io import BytesIO

from django.conf import settings
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        PermissionsMixin)
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage, send_mail
from django.db import models
from django.utils import timezone
from PIL import Image as PilImage
from PIL import ImageDraw, ImageFont

"""
Klasy w bazie danych
"""



class UserManager(BaseUserManager):
    """Tworzenie i zarządzanie użytkownikami"""
    def create_user(self, email, name, password=None, **extra_field):
        """Tworzenie użytkownika"""
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
        """Tworzenie użytkownika dla panelu admina"""
        user = self.create_user(email=email, name=name, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user




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
                message =( f"Hej {self.name}, dziekujemy za rejestrację w naszym serwisie!\n\n"
                f"Pozdrawiamy,\nHeritageWear.pl " )
                from_email = "heritage.wear.kontakt@gmail.com"
                recipient_list = [self.email]
                email = EmailMessage(subject, message, from_email, recipient_list)




class Element(models.Model):
    id = models.BigAutoField(primary_key=True)
    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable=False)
    name = models.CharField(max_length=255)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    city = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    confirmed = models.BooleanField(default=False)

    ELEMENT_TYPES = [
    ('headwear', 'Headwear'),
    ('shirt', 'Shirt'),
    ('trousers', 'Trousers'),
    ('vest', 'Vest'),
    ('shoes', 'Shoes'),
    ('accessories', 'Accessories'),
    ('jewelry', 'Jewelry'),
    ('petticoat', 'Petticoat'),
    ('dress', 'Dress'),
]

    GENDERS = [('male', 'Male'), ('female','Female')]

    SIZE_CATEGORIES= [('S', 'Small'), ('M', 'Medium'), ('L', 'Large')]

    gender = models.CharField(max_length=10, choices=GENDERS)
    size = models.CharField(max_length=50, choices=SIZE_CATEGORIES)
    element_type = models.CharField(max_length=50, choices=ELEMENT_TYPES)
    image = models.ImageField(upload_to='uploads/images/', blank=True, null=True)

    def __str__(self):
        return f"{self.name}"

    def save(self, *args, **kwargs):
        if not getattr(self.user, "is_renter", False):
            raise ValidationError("Użytkownik nie ma uprawnień wynajmującego (is_renter must be True).")

        is_new = self.pk is None
        old_extid = None
        old_confirmed = False

        if not is_new:
            old = Element.objects.filter(pk=self.pk).first()
            old_extid = old.extid if old else None
            old_confirmed = old.confirmed if old else False

        super().save(*args, **kwargs)

        if not old_confirmed and self.confirmed and self.user and getattr(self.user, 'email', None) and self.extid:
            subject = f"Element stroju zatwierdzony: {self.name}"
            message = (
                f"Hej {self.user.name},\n\n"
                f"Twój element stroju o nazwie “{self.name}” został zatwierdzony i jest teraz dostępny do wypożyczenia i rezerwacji dla innych użytkowników.\n\n"
                "Pozdrawiamy,\nHeritageWear.pl"
            )
            from_email = "heritage.wear.kontakt@gmail.com"
            recipient_list = [self.user.email]

            try:
                generated_img = PilImage.new("RGB", (600, 200), color=(255, 255, 255))
                draw = ImageDraw.Draw(generated_img)

                try:
                    font = ImageFont.truetype("arial.ttf", 48)
                except:
                    font = ImageFont.load_default()

                draw.text((50, 80), f"{self.extid}", font=font, fill=(0, 0, 0))

                buffer = io.BytesIO()
                generated_img.save(buffer, format="JPEG")
                buffer.seek(0)

                email = EmailMessage(subject, message, from_email, recipient_list)
                email.attach(f"{self.extid}.jpg", buffer.read(), "image/jpeg")
                email.send()
            except:
                pass




class Costume(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=255)
    image = models.ImageField(upload_to='uploads/images/', blank=True, null=True)

    GENDERS = [('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')]
    SIZE_CATEGORIES= [('S', 'Small'), ('M', 'Medium'), ('L', 'Large')]

    gender = models.CharField(max_length=10, choices=GENDERS)
    size = models.CharField(max_length=50, choices=SIZE_CATEGORIES)

    headwear = models.ForeignKey('Element', related_name='headwear', on_delete=models.CASCADE, blank=True, null=True)
    shirt = models.ForeignKey('Element', related_name='shirt', on_delete=models.CASCADE, blank=True, null=True)
    trousers = models.ForeignKey('Element', related_name='trousers', on_delete=models.CASCADE, blank=True, null=True)
    vest = models.ForeignKey('Element', related_name='vest', on_delete=models.CASCADE, blank=True, null=True)
    shoes = models.ForeignKey('Element', related_name='shoes', on_delete=models.CASCADE, blank=True, null=True)
    accessories = models.ForeignKey('Element', related_name='accessories', on_delete=models.CASCADE, blank=True, null=True)
    jewelry = models.ForeignKey('Element', related_name='jewelry', on_delete=models.CASCADE, blank=True, null=True)
    petticoat = models.ForeignKey('Element', related_name='petticoat', on_delete=models.CASCADE, blank=True, null=True)
    dress = models.ForeignKey('Element', related_name='dress', on_delete=models.CASCADE, blank=True, null=True)

    confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"Costume: {self.name}"

    def save(self, *args, **kwargs):
        if not getattr(self.user, "is_renter", False):
            raise ValidationError("Użytkownik nie ma uprawnień wynajmującego (is_renter must be True).")

        is_new = self.pk is None
        old_extid = None
        old_confirmed = False

        if not is_new:
            old = Costume.objects.filter(pk=self.pk).first()
            old_extid = old.extid if old else None
            old_confirmed = old.confirmed if old else False

        super().save(*args, **kwargs)

        if not old_confirmed and self.confirmed and self.user and getattr(self.user, 'email', None) and self.extid:
            subject = f"Strój zatwierdzony: {self.name}"
            message = (
                f"Hej {self.user.name},\n\n"
                f"Twój strój o nazwie “{self.name}” został zatwierdzony i jest teraz dostępny do wypożyczenia i rezerwacji dla innych użytkowników.\n\n"
                "Pozdrawiamy,\nHeritageWear.pl"
            )
            from_email = "heritage.wear.kontakt@gmail.com"
            recipient_list = [self.user.email]

            try:
                #Tworzenie pliku jpg z extid
                generated_img = PilImage.new("RGB", (600, 200), color=(255, 255, 255))
                draw = ImageDraw.Draw(generated_img)

                try:
                    font = ImageFont.truetype("arial.ttf", 48)
                except:
                    font = ImageFont.load_default()

                draw.text((50, 80), f"{self.extid}", font=font, fill=(0, 0, 0))

                buffer = io.BytesIO()
                generated_img.save(buffer, format="JPEG")
                buffer.seek(0)

                email = EmailMessage(subject, message, from_email, recipient_list)
                email.attach(f"{self.extid}.jpg", buffer.read(), "image/jpeg")
                email.send()
            except:
                pass



from django.conf import settings
from django.core.mail import send_mail
from django.db import models
from django.utils import timezone


class Rental(models.Model):
    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    element = models.ForeignKey('Element', on_delete=models.CASCADE, blank=True, null=True)
    costume = models.ForeignKey('Costume', on_delete=models.CASCADE, blank=True, null=True)

    rented = models.DateTimeField(auto_now_add=False)
    return_date = models.DateTimeField(blank=True, null=True)
    reservation = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wypożyczenie: {self.id}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        print(f"Saving Wypożyczenie instance: is_new={is_new}, ID={self.id}")


        if timezone.is_naive(self.rented):
            self.rented = timezone.make_aware(self.rented)
        if self.return_date and timezone.is_naive(self.return_date):
            self.return_date = timezone.make_aware(self.return_date)

        try:
            super().save(*args, **kwargs)
            print(f"Wypożyczenie instance saved successfully: ID={self.id}")

            if is_new:
                user_phone_number = None
                city = None

                if self.costume and self.costume.user:
                    user_phone_number = self.costume.user.phone_number
                    city = self.costume.city
                elif self.element and self.element.user:
                    city = self.element.city
                    user_phone_number = self.element.user.phone_number

                rented = timezone.localtime(self.rented).strftime('%d-%m-%Y') if self.rented else 'Brak daty'
                return_date = timezone.localtime(self.return_date).strftime('%d-%m-%Y') if self.return_date else 'Brak daty'

                name = self.element.name if self.element else self.costume.name
                if not self.reservation:
                    message = (
                        f"Cześć {self.user.name},\n\n"
                        f"Ten email jest potwierdzeniem wypożyczenia : {name}\n"
                        f"• Data rozpoczęcia wypożyczenia: {rented}\n"
                        f"• Data zwrotu: {return_date}\n"
                        f"• Miasto właściciela: {city}\n"
                        f"• Numer właściciela: {user_phone_number if user_phone_number else 'Brak numeru telefonu właściciela'}\n"
                        "Sposób przekazania stroju i warunki jego wypożyczenia proszę ustalić bezpośrednio z właścicielem stroju / elementu stroju.\n\n"
                        "Pozdrawiamy,\nHeritageWear.pl"
                    )
                else:
                    message = (
                        f"Cześć {self.user.name},\n\n"
                        f"Ten email jest potwierdzeniem rezerwacji: {name}\n"
                        f"• Data rozpoczęcia rezerwacji: {rented}\n"
                        f"• Data zakończenia rezerwacji: {return_date}\n"
                        f"• Miasto właściciela: {city}\n\n"
                        "Masz 7 dni na potwierdzenie chęci wypożyczenia stroju w podanym terminie.\n"
                        "Potwierdzenia rezerwacji możesz dokonać na stronie głównej heritage-wear.pl.\n\n"
                        "Pozdrawiamy,\n"
                        "HeritageWear.pl"
                    )

                send_mail(
                    subject="Potwierdzenie Wypożyczenia",
                    message=message,
                    from_email="heritage.wear.kontakt@gmail.com",
                    recipient_list=[self.user.email],
                    fail_silently=False,
                )
                print(f"Email sent successfully for Wypożyczenie ID={self.id}")
        except Exception as e:
            print(f"Error occurred while saving Wypożyczenie ID={self.id}: {e}")

    def delete(self, using=None, keep_parents=False):
        if self.costume and self.costume.user:
            element_name = self.costume.name
        elif self.element and self.element.user:
            element_name = self.element.name
        else:
            element_name = "nieznany przedmiot"

        try:
            send_mail(
                subject=f"Hej {self.user.name}, Twoje wypożyczenie zostało anulowane",
                message=(
                    f"Cześć {self.user.name},\n\n"
                    f"Twoje wypożyczenie przedmiotu “{element_name}” (ID {self.id}) "
                    f"od dnia {timezone.localtime(self.rented).strftime('%Y-%m-%d')} "
                    f"do dnia {timezone.localtime(self.return_date).strftime('%Y-%m-%d')} zostało anulowane.\n\n"
                    "Pozdrawiamy,\nHeritageWear.pl"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["michal.kudlinski@gmail.com"],
            )
        except Exception as e:
            print(f"Failed to send cancellation email to renter {self.user.email}: {e}")

        owner = (self.costume or self.element).user
        try:
            send_mail(
                subject=f"Zwrot przedmiotu “{element_name}” anulowany",
                message=(
                    f"Cześć {owner.name},\n\n"
                    f"Użytkownik {self.user.name} ({self.user.email}) anulował wypożyczenie "
                    f"Twojego przedmiotu “{element_name}” (ID {self.id}).\n"
                    f"Termin wypożyczenia: {timezone.localtime(self.rented).strftime('%Y-%m-%d')} "
                    f"– {timezone.localtime(self.return_date).strftime('%Y-%m-%d')}.\n\n"
                    "Przedmiot jest teraz dostępny do ponownego wypożyczenia w tym czasie.\n\n"
                    "Pozdrawiamy,\nHeritageWear.pl"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[owner.email],
            )
        except Exception as e:
            print(f"Failed to send cancellation email to owner {owner.email}: {e}")

        super().delete(using=using, keep_parents=keep_parents)




class Image(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='uploads/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.image.name

    def image_url(self):
        return self.image.url


class News(models.Model):
    name = models.CharField(max_length=100)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

class ControlMessage(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)

