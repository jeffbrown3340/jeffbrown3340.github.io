var dataKyans = [
  {"name":"Jennifer Lawrence", "hint":'Actress<br>Katness in "The Hunger Games"'},
  {"name":"Ashley Judd", "hint":'Actress<br>"Kiss the Girls"<br>"Double Jeopardy"'},
  {"name":"George Clooney", "hint":'Actor<br>"Oceans Eleven"<br>"Gravity"'},
  {"name":"Johnny Depp", "hint":'Actor<br>Captain Jack Sparrow'},
  {"name":"Mitch McConnell", "hint":'US Senate Majority Leader'},
  {"name":"Mohammed Ali", "hint":'Athlete<br>aka "The Greatest"<br>Cassius Clay'},
  {"name":"Secretariat", "hint":'Triple Crown winner 1973<br>Retired to stud at Claiborne Farm'},
  {"name":"Jim Bowie", "hint":'Hero of the Alamo<br>Inventor of the Bowie Knife'},
  {"name":"Duncan Hines", "hint":'Restaurant Guide Publisher<br>Best known for cake mixes'},
  {"name":"Hunter S Thompson", "hint":'Gonzo Journalist'},
  {"name":"Diane Sawyer", "hint":'ABC Good Morning America Host<br>Female Television Journalist'},
  {"name":"Abraham Lincoln", "hint":'Sixteenth US President<br>Profile is on the penny'},
  {"name":"Pat Riley", "hint":'Miami Heat Team President<br>Former Head Coach'}]
var gameHeadingText = document.getElementById("game-heading-text");
var gameState = "pregame";
var myNBSP = String.fromCharCode(160);
var priorGuesses = "";
var priorGuessesText = document.getElementById("prior-guesses-text");
var priorSelectors = [];
var puzzleHintText = document.getElementById("puzzle-hint-text");
var puzzleDisplayText = document.getElementById("puzzle-state-text");
var puzzleState = [];
var puzzleStatusText = document.getElementById("puzzle-status-text");
var selectorCounter = 0;
var triesRemainingText = document.getElementById("tries-remaining-text");
var userInput = "";
var userLosses = 0;
var userTries = 12;
var userWins = 0;
var currSolution;

document.onkeyup = function(event) {
  var userInputKeyCode = event.keyCode;
  if (userInputKeyCode != 32 && (userInputKeyCode < 65 || userInputKeyCode > 90)) {return}
  if (gameState === "midgame" && userInputKeyCode === 32) {return}
  if (gameState === "pregame" && userInputKeyCode >= 65 && userInputKeyCode <= 90) {return}
  if (userInputKeyCode === 32) {
    gameState = "pregame";
    gameHandler();
  } else {
    userInput = String.fromCharCode(userInputKeyCode).toLowerCase();
    if (priorGuesses.length > 0 && priorGuesses.indexOf(userInput) >= 0) {return};
    if (userTries <= 0) {return}
    gameHandler(userInput);
  }
}

function stringToArray(solutionString) {
  var tempBuff0 = [];
  for (i = 0; i < solutionString.length; i++) {
    tempBuff0.push(solutionString.charAt(i).toLowerCase());
  }
  return tempBuff0;
}

function isWinner(solution, state) {
  var tempBoo = true;
  for (i = 0; i < solution.length && tempBoo; i++) {
    tempBoo = tempBoo && state[i];
  }
  return tempBoo;
}

function solutionFormatter(solution) {
  // changes ascii 32 spaces to nbsp
  for (i = 0; i < solution.length; i++) {
    if (solution[i] === " ") {
      solution[i] = myNBSP;
    }
  }
  return solution;
}

function gameHandler(input) {
  if (gameState === "pregame") {
    priorGuesses = "";
    userTries = 12;
    var loopBreaker = 0;
    randomSelector = Math.floor(Math.random() * dataKyans.length);
    while (priorSelectors.indexOf(randomSelector) >= 0) {
      loopBreaker++;
      randomSelector = Math.floor(Math.random() * dataKyans.length);
      if (loopBreaker > 100) {
        console.log("Help me! I'm out of control!");
        return
      }
    }
    currSolution = dataKyans[randomSelector];
    priorSelectors.push(randomSelector)
    puzzleSolution = stringToArray(currSolution.name);
    puzzleSolution = solutionFormatter(puzzleSolution);
    puzzleState = initState(puzzleSolution);
    puzzleHintText.innerHTML = currSolution.hint;
    selectorCounter++;
    gameHeadingText.textContent = "Famous Kentuckian #" + selectorCounter + " (of 13)";
    puzzleStatusText.textContent = writePuzDisTxt(puzzleSolution, puzzleState);
    puzzleDisplayText.innerHTML = "Start guessing letters now...<br>we'll see if they're in the puzzle.";
    triesRemainingText.textContent = "Tries remaining = " + userTries
    gameState = "midgame";
  } else if (gameState === "midgame") {
    puzzleState = attemptHandler(puzzleSolution, puzzleState, input);
    puzzleStatusText.textContent = writePuzDisTxt(puzzleSolution, puzzleState);
    if (userTries <= 0) {
      puzzleStatusText.textContent = "Oops, you've run out of tries ... Game over.";
      puzzleDisplayText.textContent = "Correct answer = " + currSolution.name;
      userLosses++;
      triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
      priorGuessesText.textContent = "Hit the spacebar to play again";
      gameState = "pregame"
    } else if (isWinner(puzzleSolution, puzzleState)) {
      puzzleDisplayText.textContent = "Winner! Great job!";
      puzzleStatusText.textContent = currSolution.name;
      userWins++;
      triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
      priorGuessesText.textContent = "Hit the spacebar to play again";
      gameState = "pregame"
    } else if (priorSelectors.length >= dataKyans.length) {
      puzzleStatusText.innerHTML = "You've completed all<br> the puzzles<br>Game over.";
      triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
      priorGuessesText.textContent = "Refresh the page play again";
    } else {
      puzzleDisplayText.textContent = "Keep guessing ...";
      triesRemainingText.textContent = "Tries remaining = " + userTries
      priorGuessesText.textContent = priorGuesses;
    }
  }
}

function initState(solution) {
  // initialize state with false, length of solution
  // note -- solution must be already solutionFormatted
  tbufState = [];
  for (i = 0; i < solution.length; i++) {
    if (solution[i] === myNBSP) {
      tbufState.push(true);
    } else {
      tbufState.push(false);
    }
  }
  return tbufState;
}

function writePuzDisTxt(solution, state) {
    // return text representation of current puzzle state
    var tempBuffer = "";
    for (i = 0; i < solution.length; i++) {
      if (state[i]) {
        tempBuffer = tempBuffer + solution[i] + myNBSP;
      } else {
        tempBuffer = tempBuffer + "_" + myNBSP;
      }
    }
    return tempBuffer;
}

function attemptHandler(solution, state, guess) {
  // returns state of puzzle after choice
  // array of booleans equal length of solution
  // true if a letter has been matched, false if not
  // if passed state is empty, initialize all false length of solution
  var guessSuccess = false;
  for (i = 0; i < solution.length; i++) {
    if (solution[i] === guess) {
      if (state[i] === false) {
        state[i] = true;
      }
      guessSuccess = true;
    }
  }
  if (guessSuccess === false) {
    userTries--;
    priorGuesses = priorGuesses + myNBSP + guess + ",";
  }
  return state;
}