class Questions {

    #questionsArray;
    #correctAnswers;
    #points;
    #wrongAnswers;
    #backToBackCorrect;
    #game_id;

    constructor(game_id, questionsArray){
        this.#game_id = game_id
        this.#questionsArray = questionsArray
        this.i = -1
        this.#correctAnswers = 0
        this.#points = 0
        this.backToBackCorrect = 0
        this.#wrongAnswers = 0
    }

    next() {
        if (++this.i == this.#questionsArray.lenght) return null
        else return this.#questionsArray[this.i]
    }

    current() {
        if (this.i == -1) return null
        else return this.#questionsArray[this.i]
    }

    addQuestions(extraQuestionsArray) {
        this.#questionsArray = this.#questionsArray.concat(extraQuestionsArray)
    }

    correct() {
        return (++this.#correctAnswers)*100
    }

    false() {
        return ++this.#wrongAnswers
    }

    getScore() {
        return this.#correctAnswers*100
    }

    getNumberOfQuestions() {
        return this.#questionsArray.length
    }

    getWrongAnswers() {
        return this.#wrongAnswers
    }

    getGameId() {
        return this.#game_id
    }
}