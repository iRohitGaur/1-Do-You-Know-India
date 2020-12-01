var rs = require("readline-sync")
let chalk = require('chalk')
let jsonbase = require('jsonbase.com')

// Replace this token with your token (any random string)
let TOKEN = process.env.TOKEN

let store = jsonbase(TOKEN)

let log = console.log

let blueBright = chalk.bold.blueBright
let green = chalk.bold.green
let red = chalk.bold.red
let cyan = chalk.bold.cyan
let yellow = chalk.bold.yellow
let title = chalk.black.bold.bgYellow

var name = ""
var score = 0
var questionList = []
var scoreboard = []

begin()

function begin() {
  (async function () {
    // Read Scoreboard
    await store.read('scoreboard').then( resp => {
      scoreboard = resp.data
      
      log(cyan("Welcome to the game:"), yellow("How Well Do You Know India?"))
      // Read QuestionList
      store.read('questionList').then( resp => {
        questionList = resp.data
      
        // Start game
        startGame()  
      })
    })
  })()
}

function startGame() {
  // Get the name of the user
  name = rs.question(blueBright("\nWhat is your name? "))
  // Greet and instruct user
  log(green(`Hello ${name}!`))

  log("\nThere will be 10 questions.\nAnswer them with", green("y (for yes)"), "or", red("n (for no)"), "\n")
  log(cyan("+5 points for correct answer. -2 for wrong answer.\n"))

  // Get 5 random questions from the pool
  let randomQuestions5 = questionList.sort(() => .5 - Math.random()).slice(0, 10)

  // Process all questions one by one
  for (q of randomQuestions5) {
    let isCorrect = askQuestion(q.question, q.answer)
    if (isCorrect) {
      // Intimate user if his answer is correct
      log(`Your answer is ${green(isCorrect)}, current score is ${green(score)}`)
    } else {
      // Intimate user if his answer is incorrect
      log(`Your answer is ${red(isCorrect)}, current score is ${red(score)}`)
    }
    // Give detail about the answer for insight
    log(cyan("Detail:"), `\n${q.detail} \n`)
  }

  // Conclude with final score and greetings
  log(`Final score: ${green(score)} / 50`)
  log(green("Thank you for playing!"))

  compareScore()
}

// asks a question to the user and returns true or false
function askQuestion(ques, correctAnswer) {
  if ( rs.keyInYNStrict(yellow(ques)) ) {
    return checkAnswer("yes", correctAnswer)
  } else {
    return checkAnswer("no", correctAnswer)
  }
}

// compares user's answer with correct answer and returns true or false back to askQuestion()
function checkAnswer(ans, correctAnswer) {
  if (ans.toLowerCase() === correctAnswer.toLowerCase()) {
    score+=5
    return true
  } else {
    score-=2
    return false
  }
}

// Compares the current score with existing one to check if there is a highscore and updates the score if we do
function compareScore() {
  // Filter the players having score lower than current score in flag array
  let flag = scoreboard.filter( s => parseInt(s.score) <= parseInt(score) )

  // If there are any such players then the current score has beaten them and we have a highscore
  if (flag.length > 0) {
    if (scoreboard.length === 5) {
      scoreboard.sort(function(a, b) {
        return b.score - a.score;
      })
      scoreboard.pop()
    }
    
    let newScorer = {"name": name, "score": score}
    scoreboard.push(newScorer)

    log(green("Congratulations! You have a new highscore."))

    // Update new scoreboard to jsonbase
    store.write('scoreboard',scoreboard).then( () => {
      log("\nScoreboard updated")
      
      displayScoreboard()
    })
  } else {
    log(red("\nYou couldn't beat the highscore. Better luck next time!"))

    displayScoreboard()
  }
}

// Logs the Scoreboard
function displayScoreboard() {
  scoreboard.sort(function(a, b) {
    return b.score - a.score;
  })
  log(yellow("\nCurrent Scoreboard:"))
  
  for(player of scoreboard) {
    log(`Name: ${green(player.name)}. Score: ${green(player.score)}`)
  }
}

/**
 * Question credits:
 * Culture Trip: https://theculturetrip.com/asia/india/articles/12-surprising-facts-you-may-not-know-about-india/
 * ScoopWoop: https://www.scoopwhoop.com/inothernews/interesting-india/
 */