"use strict";
//Global variables
const appDiv = document.getElementById('app');
let elements = [];
let word = "";
let attempts = 0;
// ============================== ELEMENTS ==============================
const inputBox = document.createElement('input');
inputBox.setAttribute('type', 'textbox');
inputBox.setAttribute('id', 'inputBox');
elements.push(inputBox);
const guessBox = document.createElement('input');
guessBox.setAttribute('type', 'textbox');
guessBox.setAttribute('id', 'guessBox');
const alphabet = document.createElement('p');
alphabet.textContent = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
const guessAttempt = document.createElement('p');
const enterButton = document.createElement('input');
enterButton.setAttribute('type', 'button');
enterButton.setAttribute('value', 'Fetch');
enterButton.setAttribute('id', 'enterButton');
enterButton.addEventListener('click', onEnterButtonClick);
elements.push(enterButton);
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
            }
        };
        xhr.onerror = function () { alert("Request failed"); };
        xhr.send();
    }
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
function guess() {
    const guess = guessBox.value.toLowerCase();
    if (guess.length != 5) {
        alert('Input box should have exactly five characters!');
    }
    else {
        guessBox.value = "";
        guessAttempt.textContent = guess;
        if (guess == word) {
            alert('Correct!');
            guessBox.removeEventListener('keypress', onGuessBoxKeyPress);
        }
        else {
            if (attempts > 4) {
                alert(`You lose! The word is ${word}`);
                guessBox.removeEventListener('keypress', onGuessBoxKeyPress);
            }
            else {
                attempts++;
                alert(`Incorrect! Attempts left: ${6 - attempts}`);
            }
        }
    }
}
