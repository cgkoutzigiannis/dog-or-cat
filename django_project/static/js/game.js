let questions;

// Elements edited during the game
const questionImage = document.getElementById("question-img");
const scoreSpan = document.getElementById("current-score");
const totalSpan = document.getElementById("total-questions");
const correctMessageDiv = document.getElementById("correct-message");
const wrongMessageDiv = document.getElementById("wrong-message");
const numOfPhotos = 6

const lives = document.getElementsByClassName("life");

// Important variables
waitingForNextQuestion = false;
questionsCounter = 0;



document.addEventListener("DOMContentLoaded", async function () {

  const response = await fetch("http://127.0.0.1:8000/start_game/", {
    method: "POST", // or 'PUT'
    mode: "same-origin",
    headers: {
      "X-CSRFToken": csrftoken
    }})

  response.json()
  .then( data => {
    const game_id = data.gameID

    console.log(game_id)

    getQuestions(game_id, numOfPhotos)
    .then( data => {
      loadingScreen = document.getElementsByClassName("loading-screen")[0];
      loadingScreen.style.display = "none";

      newGame(data)
    })
  })

  

});

async function getQuestions(game_id, numberOfQuestions) {
  link = `http://127.0.0.1:8000/game/${game_id}/images/${numberOfQuestions}/`

  console.log(link)
  const response = await fetch(`http://127.0.0.1:8000/game/${game_id}/images/${numberOfQuestions}/`)

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
    question["blurred_image_url"]
}

function sendAnswer(answer) {
  if(!waitingForNextQuestion){
    waitingForNextQuestion = true

    if (++questionsCounter == 2)
      getQuestions(3)
      .then( data => {
        questions.addQuestions(data)
        questionsCounter = 0
      })
    

    checkAnswer(answer)
      .then( data => {
        console.log(data)
        console.log(data.answer)
        console.log(questions.getNumberOfQuestions() - questions.i + " questions left!!")
        questionImage.src = "http://127.0.0.1:8000" + data["original_image_url"]
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
  console.log(data)
  questions = new Questions(data)
  question = questions.next()
  nextQuestion(question)
  scoreSpan.innerHTML = '0'
}

function correctAnswer() {
  console.log("Correct!")
  scoreSpan.innerHTML = questions.correct()
  correctMessageDiv.classList.add("show-message")
}

function wrongAnswer() {
  console.log("Wrooong :(")
  wrongMessageDiv.classList.add("show-message")
  lives[questions.getWrongAnswers()].src = "/static/resources/no-heart.jpg"
  if (questions.false() >= 3)
    setTimeout(endGame, 3000)
}

function endGame() {
  console.log(`Your score is: ${questions.getScore()}`)

  endOfGamePlat = document.getElementById("end-of-game");
  finalScoreSpan = document.getElementById("final-score");

  endOfGamePlat.style.display = "initial"
  finalScoreSpan.innerText = `🎊${questions.getScore()}🎊`
}
