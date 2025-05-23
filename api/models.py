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
from PIL import Image as PilImage
from PIL import ImageDraw, ImageFont

"""
Klasy w bazie danych
"""



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
                f"Instrukcja dodawania swoich strojów, umożliwiając tym samym ich wypożyczenie innym użytkownikom:\n\n" \
                f"1. W szablonie pliku excel znajdującym się w załączniku proszę wypełnić dane na temat strojów i poszczególnych elementów\n" \
                f"2. Wypełnione pliki excel proszę o odesłanie na mail: heritage_wear@gmail.com wraz ze zdjęciami poszczególnych\n" \
                f"części garderoby, nazwy plików zdjęć powinny odpowiadać nazwom produktów zawartych w plikach excel.\n\n"
                f"Pozdrawiamy,\nHeritageWear.pl " )
                from_email = "heritage.wear.kontakt@gmail.com"
                recipient_list = ['michal.kudlinski@gmail.com']
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
        ('nakrycie glowy', 'Nakrycie Glowy'),
        ('koszula', 'Koszula'),
        ('spodnie', 'Spodnie'),
        ('kamizelka', 'Kamizelka'),
        ('buty', 'Buty'),
        ('akcesoria', 'Akcesoria'),
        ('bizuteria','Bizuteria'),
        ('halka', 'Halka'),
        ('sukienka', 'Sukienka'),
    ]

    GENDERS = [('meski', 'Meski'), ('damski','Damski')]

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
            recipient_list = ["michal.kudlinski@gmail.com"]

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

    GENDERS = [('meski', 'Meski'), ('damski', 'Damski'), ('unisex', 'Unisex')]
    SIZE_CATEGORIES= [('S', 'Small'), ('M', 'Medium'), ('L', 'Large')]

    gender = models.CharField(max_length=10, choices=GENDERS)
    size = models.CharField(max_length=50, choices=SIZE_CATEGORIES)

    nakrycie_glowy = models.ForeignKey('Element', related_name='nakrycie_glowy', on_delete=models.CASCADE, blank=True, null=True)
    koszula = models.ForeignKey('Element', related_name='koszula', on_delete=models.CASCADE, blank=True, null=True)
    spodnie = models.ForeignKey('Element', related_name='spodnie', on_delete=models.CASCADE, blank=True, null=True)
    kamizelka = models.ForeignKey('Element', related_name='kamizelka', on_delete=models.CASCADE, blank=True, null=True)
    buty = models.ForeignKey('Element', related_name='buty', on_delete=models.CASCADE, blank=True, null=True)
    akcesoria = models.ForeignKey('Element', related_name='akcesoria', on_delete=models.CASCADE, blank=True, null=True)
    bizuteria = models.ForeignKey('Element', related_name='bizuteria', on_delete=models.CASCADE, blank=True, null=True)
    halka = models.ForeignKey('Element', related_name='halka', on_delete=models.CASCADE, blank=True, null=True)
    sukienka = models.ForeignKey('Element', related_name='sukienka', on_delete=models.CASCADE, blank=True, null=True)

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
            recipient_list = ["michal.kudlinski@gmail.com"]

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



class Rental(models.Model):
    id = models.BigAutoField(primary_key=True)

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    element = models.ForeignKey('Element', on_delete=models.CASCADE, blank=True, null=True)
    costume = models.ForeignKey('Costume', on_delete=models.CASCADE, blank=True, null=True)

    rented = models.DateTimeField(auto_now_add=False)
    return_date = models.DateTimeField(blank=True, null=True)
    reservation = models.BooleanField(default=False)  # Czy rezerwacja
    created = models.DateTimeField(auto_now_add=True)

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

                if self.costume and self.costume.user:
                    user_phone_number = self.costume.user.phone_number
                    city = self.costume.city
                elif self.elementu and self.element.user:
                    city = self.element.city
                    user_phone_number = self.element.user.phone_number
                rented = self.rented.strftime('%d-%m-%Y') if self.rented else 'Brak daty'
                return_date = self.zwrot.strftime('%d-%m-%Y') if self.zwrot else 'Brak daty'
                # Construct the email body
                name = self.element.name if self.element else self.costume.name
                if not self.reservation:

                    message = ( f"Cześć {self.user.name},\n\n"
                              f"Ten email jest potwierdzeniem wypożyczenia : {name}\n."
                              f"• Data rozpoczęcia wypożyczenia: {rented}\n"
                              f"• Data zwrotu: {return_date}\n"
                              f"• Miasto właściciela: {city}\n"
                              f"• Numer właściciela: {user_phone_number if user_phone_number else 'Brak numeru telefonu właściciela'}\n"
                              f"Sposób przekazania stroju i warunki jego wypożyczenia proszę ustalić bezpośrednio z właścicielem stroju / elementu stroju.\n\n"
                              f"Pozdrawiamy,\nHeritageWear.pl" )

                else:
                    message = ( f"Cześć {self.user.name},\n\n"
                                f"Ten email jest potwierdzeniem rezerwacji: {name}\n"
                                f"• Data rozpoczęcia rezerwacji: {rented}\n"
                                f"• Data zakończenia rezerwacji: {return_date}\n"
                                f"• Miasto właściciela: {city}\n\n"
                                "Masz 7 dni na potwierdzenie chęci wypożyczenia stroju w podanym terminie.\n"
                                "Potwierdzenia rezerwcji możesz dokonać na stronie głównej heritage-wear.pl”.\n\n"
                                "Pozdrawiamy,\n"
                                "HeritageWear.pl"
)
                # Send confirmation email
                send_mail(
                    subject="Potwierdzenie Wypożyczenia",
                    message=message,
                    from_email="heritage.wear.kontakt@gmail.com",
                    recipient_list=['michal.kudlinski@gmail.com'],  # This can be updated as needed
                    fail_silently=False,
                )
                print(f"Email sent successfully for Wypozyczenie ID={self.id}")
        except Exception as e:
            print(f"Error occurred while saving Wypozyczenie ID={self.id}: {e}")
    def delete(self, using=None, keep_parents=False):

        if self.costume and self.costume.user:
            element_name = self.costume.name
        elif self.element and self.element.user:
            element_name = self.element.name
        else:
            element_name = "nieznany przedmiot"

        # Send to renter
        try:
            send_mail(
                subject=f"Hej {self.user.name}, Twoje wypożyczenie zostało anulowane",
                message=(
                    f"Cześć {self.user.name},\n\n"
                    f"Twoje wypożyczenie przedmiotu “{element_name}” (ID {self.id}) "
                    f"od dnia {self.rented.strftime('%Y-%m-%d')} "
                    f"do dnia {self.return_date.strftime('%Y-%m-%d')} zostało anulowane.\n\n"
                    "Pozdrawiamy,\nHeritageWear.pl"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["michal.kudlinski@gmail.com"],
            )
        except Exception as e:
            print(f"Failed to send cancellation email to renter {self.user.email}: {e}")
            # if you want to abort the delete on e‑mail failure, uncomment:
            # raise

        # Send to owner
        owner = (self.costume or self.element).user
        try:
            send_mail(
                subject=f"Zwrot przedmiotu “{element_name}” anulowany",
                message=(
                    f"Cześć {owner.name},\n\n"
                    f"Użytkownik {self.user.name} ({self.user.email}) anulował wypożyczenie "
                    f"Twojego przedmiotu “{element_name}” (ID {self.id}).\n"
                    f"Termin wypożyczenia: {self.rented.strftime('%Y-%m-%d')} "
                    f"– {self.return_date.strftime('%Y-%m-%d')}.\n\n"
                    "Przedmiot jest teraz dostępny do ponownego wypożyczenia w tym czasie.\n\n"
                    "Pozdrawiamy,\nHeritageWear.pl"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["michal.kudlinski@gmail.com"],
            )
        except Exception as e:
            print(f"Failed to send cancellation email to owner {owner.email}: {e}")
            # raise  # if you want to prevent delete on failure

        # finally, delete the record
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

