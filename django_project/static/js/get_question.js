let questions;

const questionImage = document.getElementById("question-img");

document.addEventListener("DOMContentLoaded", async function () {
  getQuestions('4')
    .then( data => {
      questions = new Questions(data)

      loadingScreen = document.getElementsByClassName("loading-screen")[0];
      loadingScreen.style.display = "none";
      question = questions.next()
      nextQuestion(question)
    })

});

async function getQuestions(numberOfQuestions) {
  const response = await fetch("http://127.0.0.1:8000/start_game/", {
    method: "POST", // or 'PUT'
    mode: "same-origin",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({
      questionsNumber: numberOfQuestions
    })
  })

  return response.json()
}

function nextQuestion(question) {
  questionImage.src =
    "http://127.0.0.1:8000" +
    question["blurred_image_url"].slice(0, 7) +
    "animals/" +
    question["blurred_image_url"].slice(7);
}

function sendAnswer(answer) {
  
  checkAnswer(answer)
    .then( data => {
      console.log(data)
      questionImage.src = "http://127.0.0.1:8000" + data["original_image_url"]
      // alert(data["answer"]);
      sleep(nextQuestion, questions.next()); 
    })
}

async function checkAnswer(answer){
  question_id = questions.current()["question_id"]
  answer_data = {
    value: `${answer}`
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

  return response.json()
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(fn, ...args) {
  await timeout(4000);
  return fn(...args);
}
