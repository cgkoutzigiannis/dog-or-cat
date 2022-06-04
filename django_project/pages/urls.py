from django.urls import path

from .views import get_images, leaderboard, check_answer, app, start_game, index

urlpatterns = [
    path("", index, name="home"),
    path("app/", app ,name="app"),
    path("start_game/", start_game, name="start_game"),
    path("game/<int:game_id>/images/<int:images_num>/", get_images, name="get_images"),
    path("<int:question_id>/check_answer/", check_answer, name="check_answer"),
    path("leaderboard/", leaderboard, name="leaderboard"),
]
