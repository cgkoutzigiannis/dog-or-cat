from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.conf import settings
import requests
from io import BytesIO
from PIL import Image, ImageFilter
from django.core.files import File
from .models import Question, SinglePlayerGame
import json

def index(request):
    return render(request, "home.html")

def game(request):
    return render(request, "game.html")

def get_question(request):
    api_key = settings.DOG_API_KEY
    headers = {"x-api-key": api_key}
    api_response = requests.get(
        f"https://api.thedogapi.com/v1/images/search", headers=headers
    )
    json_response = api_response.json()[0]
    image_url = json_response["url"]
    file_name = image_url.replace("https://cdn2.thedogapi.com/images/", "")
    file_name = file_name.replace(".jpg", "")

    image = Image.open(BytesIO(requests.get(image_url).content))
    blurred_image = image.filter(ImageFilter.GaussianBlur(40))
    blob = BytesIO()
    blur_blob = BytesIO()

    image.save(blob, "JPEG")
    blurred_image.save(blur_blob, "JPEG")
    question = Question(animal_type="dog")
    question.original_image = File(blob, name=(file_name + ".jpeg"))
    question.blurred_image = File(blur_blob, name=(file_name + "_blurred.jpeg"))
    question.save()
    images = {
        "original_image_url": f"{question.original_image.url}",
        "blurred_image_url": f"{question.blurred_image.url}",

    }
    # return HttpResponseRedirect(reverse("detail", args=(question.pk,)))
    return JsonResponse(images)

def start_game(request):
    # Create SinglePlayerGame instance.
    # Download 10 images
    # Save them to db.
    # Return list
    data = json.loads(request.body)
    questions_number = data["questionsNumber"]
    print(questions_number)
    single_player_game = SinglePlayerGame()
    single_player_game.user = request.user
    single_player_game.save()
    api_key = settings.DOG_API_KEY
    headers = {"x-api-key": api_key}
    api_response = requests.get(
        f"https://api.thedogapi.com/v1/images/search?limit={questions_number}", headers=headers
    )
    json_response = api_response.json()
    response_list = []
    for animal in json_response:
        image_url = animal["url"]
        file_name = image_url.replace("https://cdn2.thedogapi.com/images/", "")
        file_name = file_name.replace(".jpg", "")
        image = Image.open(BytesIO(requests.get(image_url).content))
        blurred_image = image.filter(ImageFilter.GaussianBlur(40))
        blob = BytesIO()
        blur_blob = BytesIO()

        image.save(blob, "JPEG")
        blurred_image.save(blur_blob, "JPEG")
        question = Question(animal_type="dog")
        question.original_image = File(blob, name=(file_name + ".jpeg"))
        question.blurred_image = File(blur_blob, name=(file_name + "_blurred.jpeg"))
        blurred_image_url = question.blurred_image.url
        question.game = single_player_game
        question.save()
        response_list.append({
            "blurred_image_url": f"{blurred_image_url}",
            "question_id": f"{question.pk}"
        })
    return JsonResponse(response_list, safe=False)

def check_answer(request, question_id):
    data = json.loads(request.body)
    answer = data["value"]
    flag = False
    question = get_object_or_404(Question, pk=question_id)
    if (question.animal_type.lower() == answer):
        # The answer is correct
        flag = True
    
    response_dict = {
        "original_image_url": f"{question.original_image.url}",
        "answer":  f"{flag}"
    }
    return JsonResponse(response_dict)