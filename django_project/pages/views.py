from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Question, SinglePlayerGame
import json
from .services import get_data

def index(request):
    return render(request, "home.html")

# def game(request):
#     return render(request, "game.html")

# def start_game(request):

#     # Return list
#     data = json.loads(request.body)
#     questions_number = data["questionsNumber"]
#     single_player_game = SinglePlayerGame()
#     single_player_game.user = request.user
#     single_player_game.amount_of_questions = int(questions_number)
#     single_player_game.save()
#     response_list = get_data(questions_number, single_player_game)
#     return JsonResponse(response_list, safe=False)

def check_answer(request, question_id):
    """
    Checks if user's answer is correct and increment the correct answer counter.
    Endpoint: <question_id>/check_answer/
    Example: 34/check_answer/
    Notes: Pass in POST request body "value:dog" or "value:cat".
    """

    # Read the user's answer from POST request.
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

def app(request):
    """
    Renders the template to start the game.
    Endpoint: app/
    """
    return render(request, "game.html")

def start_game(request):
    """
    Creates a new game instance and returns the id.
    Endpoint: start-game/
    """
    single_player_game = SinglePlayerGame()
    single_player_game.user = request.user
    single_player_game.save()
    return JsonResponse({"gameID": single_player_game.pk})

def get_images(request, game_id, images_num):
    """
    Creates new question instances and downloads images.
    Endpoint: game/<game_id>/images/<number_of_images>/
    Example: game/2/images/10/
    Create 10 new Question instances and return the images
    on the game with ID 2.
    """
    print(game_id)
    print(images_num)
    game = get_object_or_404(SinglePlayerGame, pk=game_id)
    response_list = get_data(images_num, game)
    print(response_list)
    return JsonResponse(response_list, safe=False)


def leaderboard(request):
    """
    Returns top 10 games and all logged-in user games.
    Endpoint: leaderboard/
    """
    top = SinglePlayerGame.objects.all().order_by('-correct_anwsers')[:10]
    top_points = []
    for game in top:
        top_points.append({
            "user": game.user,
            "points": game.correct_anwsers * 100
        })
    
    user_games = SinglePlayerGame.objects.filter(user=request.user).order_by('-correct_anwsers')[:1]
    user_games_points = []
    for user_game in user_games:
        user_games_points.append({
            "user": user_game.user,
            "points": user_game.correct_anwsers * 100
        })

    return render(request, "leaderboard.html", {"top_games": top_points, "user_games": user_games_points})