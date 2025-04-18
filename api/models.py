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
        """Tworzenie uzytkownika"""
        if not name:
            raise ValueError("User must have a name")
        if not email:
            raise ValueError("The email field is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_field)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, name, password,email):
        """Tworzenie uzytkownika jako Admin"""
        user = self.create_user(name, password,email)
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

    objects = UserManager()

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = ['email']



class ElementStroju(models.Model):
    id  = models.BigAutoField(primary_key  = True)

    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable = False)


    name = models.CharField(max_length= 255)

    description = models.TextField(blank=True)

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

    GENDERS = [
        ('meski', 'Meski'),
        ('damski','Damski'),    ]

    gender = models.CharField(
        max_length = 10,
        choices = GENDERS,
    )

    element_type = models.CharField(
        max_length = 50,
        choices = ELEMENT_TYPES)

    #image = models.ImageField(upload_to='element_stroju_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.name}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            send_mail(
                subject="Potwierdzenie Utworzenia Elementu Stroju",
                message=f"Element stroju '{self.name}' został pomyślnie utworzony.",
                from_email="noreply@example.com",
                recipient_list=[self.user.email],
            )


class Stroj(models.Model):

    id = models.BigAutoField(primary_key=True)


    extid = models.CharField(max_length=255, unique=True, blank=True, null=True, editable=False)


    name = models.CharField(max_length=255)


    description = models.TextField(blank=True)


    GENDERS = [
        ('meski', 'Meski'),
        ('damski', 'Damski'),
    ]

    gender = models.CharField(
        max_length=10,
        choices=GENDERS,
    )


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
        super().save(*args, **kwargs)
        if is_new:
            send_mail(
                subject="Potwierdzenie Wypożyczenia",
                message=f"Wypożyczenie o ID {self.id} zostało pomyślnie utworzone.",
                from_email="heritagewearpoland@outlook.com",
                recipient_list=[self.user.email],
            )


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

