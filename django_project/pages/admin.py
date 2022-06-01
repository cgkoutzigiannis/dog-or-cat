from django.contrib import admin

from .models import Question, SinglePlayerGame

admin.site.register(Question)
admin.site.register(SinglePlayerGame)
