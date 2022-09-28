"use strict";
//Global variables
const appDiv = document.getElementById('app');
let elements = [];
let word = "";
let attempts = 0;
let textUrl = "https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/ca9018b32e963292473841fb55fd5a62176769b5/valid-wordle-words.txt";
/*
GAME STATES
0 - Pre-game
1 - In-game
2 - Post-game (win)
3 - Post-game (lose)
*/
let gameState = 0;
let canInput = false;
// ============================== ELEMENTS ==============================
const inputBox = document.createElement('input');
inputBox.setAttribute('type', 'textbox');
inputBox.setAttribute('id', 'inputBox');
elements.push(inputBox);
const guessBox = document.createElement('input');
guessBox.setAttribute('type', 'textbox');
guessBox.setAttribute('id', 'guessBox');
const alphabet = document.createElement('p');
alphabet.textContent = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z\n";
const guessAttempt = document.createElement('p');
guessAttempt.textContent = " ";
const enterButton = document.createElement('input');
enterButton.setAttribute('type', 'button');
enterButton.setAttribute('value', 'Fetch');
enterButton.setAttribute('id', 'enterButton');
enterButton.addEventListener('click', onEnterButtonClick);
elements.push(enterButton);
elements.push(guessAttempt);
document.addEventListener('keydown', onKeyPress);
//Sounds
let heartbeat = new Audio('heartbeat.mp3');
// ======================================================================
appDiv?.replaceChildren(...elements);
// ============================== FUNCTIONS ==============================
function onEnterButtonClick() {
    const textUrl = inputBox.value;
    if (textUrl == "") {
        alert('No URL was specified');
        return;
    }
    else {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', textUrl, true);
        //onload and onerror code from https://javascript.info/xmlhttprequest
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            }
            else {
                let array = xhr.responseText.split("\n");
                let randomInt = Math.floor(Math.random() * array.length);
                word = array[randomInt];
                console.log(word);
                appDiv?.replaceChildren();
                createGuessBox();
                initBoard();
                gameState = 1;
            }
        };
        xhr.onerror = function () { alert("Request failed"); };
        xhr.send();
    }
}
//================================= Events =================================
function onKeyPress(event) {
    if (gameState != 1) {
        return;
    }
    if (event.key.match(/[a-z]/i) && event.key != "Enter" && event.key != "Backspace" && event.key != "Shift" && event.key != "Control" && event.key != "Alt") {
        let audio = new Audio('keypress.mp3');
        audio.play();
    }
}
// ======================================================================
function guess() {
    if (!canInput) {
        return;
    }
    const guess = guessBox.value.toLowerCase();
    if (guess.length != 5) {
        alert('Input box should have exactly five characters!');
    }
    else {
        guessBox.value = "";
        guessAttempt.textContent = guess;
        //Valid guess
        canInput = false;
        for (let pos = 0; pos < 5; pos++) {
            setTimeout(() => {
                if (guess[pos] != word[pos]) {
                    if (word.includes(guess[pos])) {
                        setBoxState(attempts, pos, "misplaced", guess[pos]);
                    }
                    else {
                        setBoxState(attempts, pos, "incorrect", guess[pos]);
                    }
                }
                else {
                    setBoxState(attempts, pos, "correct", guess[pos]);
                }
            }, 200 * pos);
        }
        setTimeout(() => {
            if (guess == word) {
                gameState = 2;
                let audio = new Audio('correct.mp3');
                audio.play();
                guessBox.removeEventListener('keypress', onGuessBoxKeyPress);
                setTimeout(() => { heartbeat.pause(); }, 1);
                setTimeout(() => { alert(`Correct! The word is indeed ${word}.`); }, 5);
            }
            else {
                if (attempts > 4) {
                    guessBox.removeEventListener('keypress', onGuessBoxKeyPress);
                    gameState = 3;
                    let audio = new Audio('sus.mp3');
                    audio.play();
                    setTimeout(() => { heartbeat.pause(); }, 1);
                    setTimeout(() => { alert(`You lose! The word is ${word}`); }, 5);
                }
                else {
                    attempts++;
                    let sound_incorrect = new Audio('wrong.mp3');
                    sound_incorrect.play();
                    if (attempts == 5) {
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => { getBlockElement(attempts, i)?.classList.add("almost-defeat"); }, 20 * i);
                        }
                        heartbeat.addEventListener('ended', loopHeartbeat);
                        heartbeat.play();
                    }
                    setTimeout(() => { alert(`Incorrect! Attempts left: ${6 - attempts}`); canInput = true; }, 101);
                }
            }
        }, 1001);
    }
}
function loopHeartbeat() {
    if (gameState == 1) {
        heartbeat.currentTime = 0;
        heartbeat.play();
    }
    else {
        heartbeat.pause();
    }
}
function getBlockElement(attempt, positionFromLeft) {
    return document.getElementById(`box-${attempt}-${positionFromLeft}`);
}
function setBoxState(row, col, className, letter) {
    let box = getBlockElement(row, col);
    if (box == null) {
        return;
    }
    box.textContent = letter.toUpperCase();
    box.setAttribute('class', className);
}
function createGuessBox() {
    elements = [guessBox, guessAttempt, alphabet];
    appDiv?.replaceChildren(...elements);
    guessBox.addEventListener('keypress', onGuessBoxKeyPress);
}
function onGuessBoxKeyPress(event) {
    if (event.key === 'Enter') {
        guess();
    }
}
function initBoard() {
    let board = document.getElementById("board");
    if (board == null) {
        return;
    }
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < 5; j++) {
            setTimeout(() => {
                let box = document.createElement("span");
                box.setAttribute('id', `box-${i}-${j}`); //row, column
                box.className = "nocolor";
                box.textContent = "";
                row.appendChild(box);
                let audio = new Audio('pop.mp3');
                audio.playbackRate = 2;
                audio.play();
            }, j * 50 + i * 200);
        }
        board.appendChild(row);
    }
    setTimeout(() => {
        canInput = true;
    }, 1251);
    elements.push(board);
    appDiv?.replaceChildren(...elements);
}
