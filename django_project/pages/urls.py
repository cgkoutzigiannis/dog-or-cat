from django.urls import path

from .views import index, game, start_game, check_answer

urlpatterns = [
    path("", index, name="home"),
    path("game/", game ,name="game"),
    path("start_game/", start_game, name="start_game"),
    path("<int:question_id>/check_answer/", check_answer, name="check_answer"),
]
