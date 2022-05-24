let questions;

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

document.addEventListener("DOMContentLoaded", async function () {

  const response = await fetch("http://127.0.0.1:8000/start_game/", {
    method: "POST", // or 'PUT'
    mode: "same-origin",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({
      questionsNumber: "11"
    })
  });

  questions = await response.json();
  showForm(questions[0]);
});

function showForm(question) {
  const blurred_image = document.createElement("img");
  blurred_image.src =
    "http://127.0.0.1:8000" +
    question["blurred_image_url"].slice(0, 7) +
    "animals/" +
    question["blurred_image_url"].slice(7);
  document.querySelector("#image").appendChild(blurred_image);

  const catButton = document.createElement("button");
  catButton.type = "button";
  catButton.innerHTML = "Cat";
  const catData = {
    value: "cat",
  };
  catButton.onclick = function () {
    fetch(`http://127.0.0.1:8000/${question["question_id"]}/check_answer/`, {
      method: "POST", // or 'PUT'
      mode: "same-origin",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(catData),
    });
  };

  // Create Dog button.
  const dogButton = document.createElement("button");
  dogButton.type = "button";
  dogButton.innerHTML = "Dog";
  dogButton.onclick = function () {
    sendAnswer("dog", question["question_id"]);
  };

  document.querySelector("#buttons").appendChild(catButton);
  document.querySelector("#buttons").appendChild(dogButton);
}

async function sendAnswer(answer, question_id) {
  answer_data = {
    value: `${answer}`,
  };
  const response = await fetch(
    `http://127.0.0.1:8000/${question_id}/check_answer/`,
    {
      method: "POST", // or 'PUT'
      mode: "same-origin",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(answer_data),
    }
  );
  const data = await response.json();
  const img = document.querySelector("img");
  img.setAttribute("src", "http://127.0.0.1:8000" + data["original_image_url"]);
  alert(data["answer"]);
  setTimeout(showForm(questions[1]), 5000);
}
