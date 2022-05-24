from django.db import models
from django.conf import settings

class SinglePlayerGame(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    correct_anwsers = models.IntegerField(default=0)
    amount_of_questions = models.IntegerField(default=10)

class Question(models.Model):
    original_image = models.ImageField(upload_to="animals")
    blurred_image = models.ImageField(upload_to="animals")

    ANIMAL_TYPE_CHOICES = [
        ("dog", "Dog"),
        ("cat", "Cat"),
    ]
    game = models.ForeignKey(SinglePlayerGame, on_delete=models.CASCADE)
    animal_type = models.CharField(max_length=3, choices=ANIMAL_TYPE_CHOICES)

    def __str__(self):
        return str(self.animal_type)