from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.conf import settings
import requests
from io import BytesIO
from PIL import Image, ImageFilter
from django.core.files import File
from .models import Question, SinglePlayerGame
import json
from .services import get_data

def index(request):
    return render(request, "home.html")

def game(request):
    return render(request, "game.html")

def start_game(request):

    # Return list
    data = json.loads(request.body)
    questions_number = data["questionsNumber"]
    single_player_game = SinglePlayerGame()
    single_player_game.user = request.user
    single_player_game.amount_of_questions = int(questions_number)
    single_player_game.save()
    response_list = get_data(questions_number, single_player_game)

    return JsonResponse(response_list, safe=False)

def check_answer(request, question_id):
    data = json.loads(request.body)
    answer = data["value"]
    flag = False
    question = get_object_or_404(Question, pk=question_id)
    if (question.animal_type.lower() == answer):
        # The answer is correct
        flag = True
        game = question.game
        game.correct_anwsers += 1
        game.save()
    
    response_dict = {
        "original_image_url": f"{question.original_image.url}",
        "answer":  f"{flag}"
    }
    return JsonResponse(response_dict)