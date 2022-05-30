let questions;

const questionImage = document.getElementById("question-img");
const scoreSpan = document.getElementById("current-score");
const totalSpan = document.getElementById("total-questions");
const correctMessageDiv = document.getElementById("correct-message");
const wrongMessageDiv = document.getElementById("wrong-message");
const numOfPhotos = '3'

waitingForNextQuestion = false;

document.addEventListener("DOMContentLoaded", async function () {
  getQuestions(numOfPhotos)
    .then( data => {
      loadingScreen = document.getElementsByClassName("loading-screen")[0];
      loadingScreen.style.display = "none";

      newGame(data)
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
  waitingForNextQuestion = false;
  wrongMessageDiv.classList.remove("show-message")
  correctMessageDiv.classList.remove("show-message")

  if (question == null) 
    return endGame()

  questionImage.src =
    "http://127.0.0.1:8000" +
    question["blurred_image_url"].slice(0, 7) +
    "animals/" +
    question["blurred_image_url"].slice(7);
}

function sendAnswer(answer) {
  if(!waitingForNextQuestion){
    waitingForNextQuestion = true
    checkAnswer(answer)
      .then( data => {
        console.log(data)
        console.log(data.answer)
        questionImage.src = "http://127.0.0.1:8000" + data["original_image_url"]
        // alert(data["answer"]);
        if (data.answer == 'True') {
          correctAnswer()
        }
        else {
          wrongAnswer()
        }
        sleep(nextQuestion, questions.next()); 
      })
  }
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
  await timeout(3000);
  return fn(...args);
}

function newGame(data) {
  questions = new Questions(data)
  question = questions.next()
  nextQuestion(question)
  scoreSpan.innerHTML = '0'
  totalSpan.innerHTML = questions.questionsArray.length
}

function correctAnswer() {
  console.log("Correct!")
  scoreSpan.innerHTML = ++questions.correctAnswers
  correctMessageDiv.classList.add("show-message")
}

function wrongAnswer() {
  console.log("Wrooong :(")
  wrongMessageDiv.classList.add("show-message")
}

function endGame() {
  console.log(`Your score is: ${questions.correctAnswers}/${questions.questionsArray.length}`)

  endOfGamePlat = document.getElementById("end-of-game");
  finalScoreSpan = document.getElementById("final-score");

  endOfGamePlat.style.display = "initial"
  finalScoreSpan.innerText = `${questions.correctAnswers}/${questions.questionsArray.length}`
}
