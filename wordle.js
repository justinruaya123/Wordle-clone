"use strict";
//Global variables
const appDiv = document.getElementById('app');
let elements = [];
let word = "";
let attempts = 0;
let guess = "";
//Array of letters from A to Z
const keyboardFirstRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const keyboardSecondRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const keyboardThirdRow = ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'];
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
inputBox.setAttribute('value', textUrl); //Default URL
elements.push(inputBox);
const enterButton = document.createElement('input');
enterButton.setAttribute('type', 'button');
enterButton.setAttribute('value', 'Start Game');
enterButton.setAttribute('id', 'enterButton');
enterButton.addEventListener('click', onEnterButtonClick);
elements.push(enterButton);
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
                word = array[randomInt].toUpperCase();
                console.log(word);
                elements = [];
                appDiv?.replaceChildren();
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
    pressButton(event.key);
}
function pressButton(key) {
    if (gameState != 1 || !canInput) {
        return;
    }
    if (key == "Enter") {
        guessAnswer();
        return;
    }
    if (key == "Backspace") {
        popCharacter();
        return;
    }
    if (key.match(/[a-zA-Z]/) && key.length == 1) {
        if (pushCharacter(key)) {
            let audio = new Audio('keypress.mp3');
            audio.play();
        }
    }
}
// ======================================================================
function guessAnswer() {
    if (!canInput) {
        return;
    }
    if (guess.length != 5) {
        alert('Input box should have exactly five characters!');
    }
    else {
        //Valid guess
        canInput = false;
        let colors = [];
        let permute = [];
        //First pass remove 
        for (let pos = 0; pos < 5; pos++) {
            if (guess[pos] == word[pos]) {
                colors[pos] = "correct";
            }
            else {
                permute.push(word[pos]);
            }
        }
        for (let pos2 = 0; pos2 < 5; pos2++) {
            if (colors[pos2] == "correct") {
                continue;
            }
            //Remove one character in permute if it exists
            let index = permute.indexOf(guess[pos2]);
            if (index != -1) {
                permute.splice(index, 1);
                colors[pos2] = "misplaced";
            }
            else {
                colors[pos2] = "incorrect";
            }
        }
        for (let pos = 0; pos < 5; pos++) {
            setTimeout(() => {
                setBoxState(attempts, pos, colors[pos], guess[pos]);
            }, 200 * pos);
        }
        setTimeout(() => {
            if (guess == word) {
                gameState = 2;
                let audio = new Audio('victory.mp3');
                audio.play();
                document.removeEventListener('keypress', onKeyPress);
                setTimeout(() => { heartbeat.pause(); }, 1);
                setTimeout(() => { alert(`Correct! The word is indeed ${word}.`); }, 5);
            }
            else {
                if (attempts > 4) {
                    document.removeEventListener('keypress', onKeyPress);
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
            guess = "";
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
    let back = document.createElement("span");
    back.textContent = box.textContent;
    box.appendChild(back);
    box.classList.remove("almost-defeat");
    back.classList.add(className);
    box.offsetHeight; //Flush CSS
    box?.classList.add("flip");
    let flip = new Audio('flip.mp3');
    flip.play();
}
function pushCharacter(chara) {
    if (guess.length >= 5) {
        return false;
    }
    let box = getBlockElement(attempts, guess.length);
    if (box == null) {
        return false;
    }
    box.textContent = chara.toUpperCase();
    box.classList.add("animateappear");
    box.classList.remove("animateout");
    guess += chara.toUpperCase();
    return true;
}
function popCharacter() {
    if (guess.length == 0) {
        return;
    }
    let box = getBlockElement(attempts, guess.length - 1);
    if (box == null) {
        return;
    }
    guess = guess.slice(0, -1);
    box.classList.remove("animateappear");
    box.classList.add("animateout");
    box.textContent = "";
}
function initBoard() {
    let board = document.getElementById("board");
    if (board == null) {
        return;
    }
    board.className = "main";
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.className = "center";
        for (let j = 0; j < 5; j++) {
            setTimeout(() => {
                let box = document.createElement("span");
                box.setAttribute('id', `box-${i}-${j}`); //row, column
                box.className = "nocolor";
                box.classList.add("unselectable");
                box.textContent = "";
                row.appendChild(box);
                let audio = new Audio('pop.mp3');
                audio.playbackRate = 2;
                audio.play();
                if (i == 5 && j == 4) {
                    setTimeout(() => { createKeyboard(); }, 1);
                }
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
function createKeyboard() {
    let keyboard = document.getElementById("keyboard");
    if (keyboard == null) {
        return;
    }
    keyboard.className = "keyboard";
    createRow(keyboardFirstRow, keyboard);
    createRow(keyboardSecondRow, keyboard);
    createRow(keyboardThirdRow, keyboard);
    elements.push(keyboard);
    appDiv?.replaceChildren(...elements);
}
function createRow(arr, keyboard) {
    //foreach letter in arr
    let row = document.createElement("div");
    row.className = "row";
    row.classList.add("center");
    for (let c of arr) {
        let key = document.createElement("span");
        key.setAttribute('id', `key-${c}`);
        key.className = c == ("Enter" || c == "Backspace") ? "key_enter" : "key_letter";
        key.classList.add("unselectable");
        key.textContent = (c == "Backspace") ? "<" : c;
        key.addEventListener('click', () => {
            pressButton(c);
        });
        row.appendChild(key);
    }
    keyboard.appendChild(row);
}
