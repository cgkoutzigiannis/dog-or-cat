from email import header
from tkinter import N
from django.conf import settings
import requests
from random import randint, shuffle
from PIL import Image, ImageFilter
from io import BytesIO
from .models import Question, SinglePlayerGame
from django.core.files import File

DOG_API_KEY = settings.DOG_API_KEY
CAT_API_KEY = settings.CAT_API_KEY

DOG_URL = "https://api.thedogapi.com/v1/images/search/"
CAT_URL = "https://api.thecatapi.com/v1/images/search/"

DOG_IMAGE_URL = "https://cdn2.thedogapi.com/images/"
CAT_IMAGE_URL = "https://cdn2.thecatapi.com/images/"

DOG_HEADERS = {"x-api-key": DOG_API_KEY}
CAT_HEADERS = {"x-api-key": CAT_API_KEY}


def get_data(total_number, game):
    # Get total number of entries.
    # Split number of entries randomly.
    
    dog_entries = randint(1, int(total_number))
    cat_entries = int(total_number) - dog_entries

    # Dog API request.
    dog_response = get_images(True, dog_entries, game)
    # Cat API request.
    cat_response = get_images(False, cat_entries, game)
    
    # Concatenate requests.
    response_list = cat_response + dog_response
    # Shuffle request list.

    shuffle(response_list)
    return response_list

def get_images(isDog, entries_num, game):
    # Initialize variables.
    headers = DOG_HEADERS
    base_url = DOG_URL
    base_image_url = DOG_IMAGE_URL
    animal_type = "dog"
    if (not isDog):
        headers = CAT_HEADERS
        base_url = CAT_URL
        animal_type = "cat"
        base_image_url = CAT_IMAGE_URL
    number_of_images = int(entries_num)

    response = []
    while number_of_images >= 1:
        # Make API request data.
        api_response = requests.get(
            base_url, headers=headers
        )
        api_response = api_response.json()
        # Make API request for image.
        image_url = api_response[0]["url"]
        image = None
        blurred_image = None
        # Blur the image.
        try:
            image = Image.open(BytesIO(requests.get(image_url).content))
            blurred_image = image.filter(ImageFilter.GaussianBlur(20))
        except ValueError as err:
            print("Found image with wrong mode")
            print(err)
            continue
        # If it works save it to db.
        file_name = image_url.replace(base_image_url, "")
        file_name = file_name.replace(".jpg", "")
        blob = BytesIO()
        blur_blob = BytesIO()
        image.convert('RGB').save(blob, "JPEG")
        blurred_image.convert('RGB').save(blur_blob, "JPEG")
        question = Question(animal_type=animal_type)
        question.original_image = File(blob, name=(file_name + ".jpeg"))
        question.blurred_image = File(blur_blob, name=(file_name + "_blurred.jpeg"))
        question.game = game
        question.save()
        number_of_images -= 1
        response.append({
            "blurred_image_url": f"{question.blurred_image.url}",
            "question_id": f"{question.pk}"
        })
    print(response)
    return response
