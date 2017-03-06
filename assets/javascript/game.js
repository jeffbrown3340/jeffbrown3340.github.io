/* Jeff Brown 2/27 thru 3/6/2017
 *
 *Core of game is three arrays
 *-- puzzleSolution -- array of letters from data name string
 *-- puzzleState -- initial blank spaces same length are fliped/revealed as letters are guessed correctly
 */


// data in objects
var dataKyans = [
  {"name":"Jennifer Lawrence", "hint":'Actress<br>Katness in "The Hunger Games"', "img": 'assets/images/jenniferlawrence.png'},
  {"name":"Ashley Judd", "hint":'Actress<br>"Kiss the Girls"<br>"Double Jeopardy"', "img": 'assets/images/ashleyjudd.png'},
  {"name":"George Clooney", "hint":'Actor<br>"Oceans Eleven"<br>"Gravity"', "img": 'assets/images/georgeclooney.png'},
  {"name":"Johnny Depp", "hint":'Actor<br>Captain Jack Sparrow', "img": 'assets/images/johnnydepp.png'},
  {"name":"Mitch McConnell", "hint":'US Senate Majority Leader', "img": 'assets/images/mitchmcconnell.png'},
  {"name":"Mohammed Ali", "hint":'Athlete<br>aka "The Greatest"<br>Cassius Clay', "img": 'assets/images/mohammedali.png'},
  {"name":"Secretariat", "hint":'Triple Crown winner 1973<br>Retired to stud at Claiborne Farm', "img": 'assets/images/secretariat.png'},
  {"name":"Jim Bowie", "hint":'Hero of the Alamo<br>Inventor of the Bowie Knife', "img": 'assets/images/jimbowie.png'},
  {"name":"Duncan Hines", "hint":'Restaurant Guide Publisher<br>Best known for cake mixes', "img": 'assets/images/duncanhines.png'},
  {"name":"Hunter S Thompson", "hint":'Gonzo Journalist', "img": 'assets/images/huntersthompson.png'},
  {"name":"Diane Sawyer", "hint":'ABC Good Morning America Host<br>Female Television Journalist', "img": 'assets/images/dianesawyer.png'},
  {"name":"Abraham Lincoln", "hint":'Sixteenth US President<br>Profile is on the penny', "img": 'assets/images/abrahamlincoln.png'},
  {"name":"Pat Riley", "hint":'Miami Heat Team President<br>Former Head Coach', "img": 'assets/images/patriley.png'},
  {"name":"Tom Cruise", "hint":'Actor<br>"Mission Impossible"<br>"Risky Business"', "img": 'assets/images/tomcruise.png'}]
var gameHeadingText = document.getElementById("game-heading-text");
var gameState = "pregame";
var myNBSP = String.fromCharCode(160);
var priorGuesses = "";
var priorGuessesText = document.getElementById("prior-guesses-text");
var priorSelectors = [];
var puzzleHintText = document.getElementById("puzzle-hint-text");
var puzzleDisplayText = document.getElementById("puzzle-state-text");
var puzzleSolution = [];
var puzzleState = [];
var puzzleStatusDiv = document.getElementById("puzzle-status-div");
var puzzleStatusText = document.getElementById("puzzle-status-text");
var selectorCounter = 0;
var triesRemainingText = document.getElementById("tries-remaining-text");
var userInput = "";
var userLosses = 0;
var userTries = 12;
var userWins = 0;
var currSolution;

// event handler
document.onkeyup = function(event) {
  //capture key code for filtering
  var userInputKeyCode = event.keyCode;
  // gameState handled in gameHandler()
  if (gameState === "gameover") {
    gameHandler();
  // always ignore everything except spacebar and letters a-z
  } else if (userInputKeyCode != 32 && (userInputKeyCode < 65 || userInputKeyCode > 90)) {return}
  // ignore spacebar during game
  if (gameState === "midgame" && userInputKeyCode === 32) {return}
  // ignore letters before game starts
  if (gameState === "pregame" && userInputKeyCode >= 65 && userInputKeyCode <= 90) {return}
  // spacebar starts game
  if (userInputKeyCode === 32) {
    gameState = "pregame";
    gameHandler();
  // letters a-z sent to gameHandler()
  } else {
  	// convert to char for gameHandler()
    userInput = String.fromCharCode(userInputKeyCode).toLowerCase();
    // ignore letters already guessed
    if (priorGuesses.length > 0 && priorGuesses.indexOf(userInput) >= 0) {return};
    // ignore when tries have been exhausted
    if (userTries <= 0) {return}
    // call gameHandler with user input (duh)
    gameHandler(userInput);
  }
}

function stringToArray(solutionString) {
  // convert the randomly selected name to an array of letters
  var tempBuff0 = [];
  for (i = 0; i < solutionString.length; i++) {
    tempBuff0.push(solutionString.charAt(i).toLowerCase());
  }
  return tempBuff0;
}

function isWinner(solution, state) {
  // winner by definition is when all gameState members are true 
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
  // write to display based on game state
  if (gameState === "gameover") {
    //puzzleStatusText.innerHTML = "You've completed all<br> the puzzles<br>Game over.";
    puzzleStatusDiv.innerHTML = '<h1 id="puzzle-status-text">Fill in the blanks<br>by guessing letters.</h1>';
    triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
    puzzleDisplayText.innerHTML = "Nice Job! You're now an<br>Honary Kentuckian!";
    priorGuessesText.textContent = "Refresh the page play again";
  } else if (gameState === "pregame") {
  	// initialize for new game
    priorGuesses = "";
    userTries = 12;
    // during coding needed a lifeline in case of infinite loop
    var loopBreaker = 0;
    // pic a random element number
    randomSelector = Math.floor(Math.random() * dataKyans.length);
    while (priorSelectors.indexOf(randomSelector) >= 0) {
      loopBreaker++;
      randomSelector = Math.floor(Math.random() * dataKyans.length);
      if (loopBreaker > 1000) {
        console.log("Help me! I'm out of control!");
        return
      }
    }
    // apply random element to solution object
    currSolution = dataKyans[randomSelector];
    // append selected (random) element index to array
    // so no duplication of puzzles
    // note -- puzzles appear randomly but there's only 14 famous people in Kentucky
    priorSelectors.push(randomSelector)
    // convert name string to array of letters
    puzzleSolution = stringToArray(currSolution.name);
    // preserve the space for display elegance
    puzzleSolution = solutionFormatter(puzzleSolution);
    // initialize blank spaces for display
    puzzleState = initState(puzzleSolution);
    // put the hint in front of the user
    puzzleHintText.innerHTML = currSolution.hint;
    // give a sense of game progress, item x of y items
    selectorCounter++;
    // display information
    gameHeadingText.textContent = "Kentuckian #" + selectorCounter + " (of "+ dataKyans.length + ")";
    // puzzleStatusText.textContent = writePuzDisTxt(puzzleSolution, puzzleState);
    puzzleStatusDiv.innerHTML = '<h1 id="puzzle-status-text">' + writePuzDisTxt(puzzleSolution, puzzleState) + '</h1>';
    puzzleDisplayText.innerHTML = "Start guessing letters now...<br>we'll see if they're in the puzzle.";
    triesRemainingText.textContent = "Tries remaining = " + userTries
    // change game state from new to in progress
    gameState = "midgame";
  } else if (gameState === "midgame") {
  	// query the puzzle for guess correctness
    puzzleState = attemptHandler(puzzleSolution, puzzleState, input);
    // refresh puzzle display in it's current state
    //puzzleStatusText.textContent = writePuzDisTxt(puzzleSolution, puzzleState);
    puzzleStatusDiv.innerHTML = '<h1 id="puzzle-status-text">' + writePuzDisTxt(puzzleSolution, puzzleState) + '</h1>';
    // check for end of this round
    // first, did they lose the round?
    if (userTries <= 0) {
      // puzzleStatusText.textContent = "Oops, you've run out of tries ... Game over.";
      puzzleStatusDiv.innerHTML = '<h1 id="puzzle-status-text">' + "Oops, you've run out of tries<br>Game over.</h1>";
      // display correct answer
      puzzleDisplayText.textContent = "Correct answer = " + currSolution.name;
      // increment loss counter
      userLosses++;
      triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
      priorGuessesText.textContent = "Hit the spacebar to play again";
      // check for end of all items
      if (priorSelectors.length >= dataKyans.length) {
        gameState = "gameover";
      } else {
      	// pregame state sets up next round
        gameState = "pregame";
      }
      // check if they won the round
    } else if (isWinner(puzzleSolution, puzzleState)) {
      puzzleDisplayText.textContent = "Winner! Great job!";
      // display picture and correct answer
      // puzzleStatusText.innerHTML = currSolution.name
      // '<h1 id="puzzle-status-text">' + writePuzDisTxt(puzzleSolution, puzzleState) + '</h1>';      
      // puzzleStatusDiv.innerHTML = '<img src="' + currSolution.img + '" />' + puzzleStatusDiv.innerHTML
      puzzleStatusDiv.innerHTML = '<img src="' + currSolution.img + '" /><h1>' + currSolution.name + '</h1>';
      // increment win counter
      userWins++;
      triesRemainingText.textContent = "Wins = " + userWins + ", Losses = " + userLosses;
      priorGuessesText.textContent = "Hit the spacebar to play again";
      // same as above, check for last round
      if (priorSelectors.length >= dataKyans.length) {
        gameState = "gameover";
      } else {
        gameState = "pregame";
      }
    } else {
      //mid game display
      puzzleDisplayText.textContent = "Keep guessing ...";
      triesRemainingText.textContent = "Tries remaining = " + userTries
      // add this unsuccessful guess to history
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