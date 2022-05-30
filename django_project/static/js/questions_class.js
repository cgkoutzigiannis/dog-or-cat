class Questions {
    constructor(questionsArray){
        this.questionsArray = questionsArray
        this.i = -1
        this.correctAnswers = 0
    }

    next() {
        if (++this.i == this.questionsArray.lenght) return null
        else return this.questionsArray[this.i]
    }

    current() {
        if (this.i == -1) return null
        else return this.questionsArray[this.i]
    }

    
}