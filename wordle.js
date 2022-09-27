"use strict";
const appDiv = document.getElementById('app');
let elements = [];
function initialize() {
    if (appDiv != null) {
        //Elements
        const sortedBox = document.createElement('input');
        sortedBox.setAttribute('type', 'textbox');
        sortedBox.setAttribute('id', 'sortedBox');
        elements.push(sortedBox);
        const enterButton = document.createElement('input');
        enterButton.setAttribute('type', 'button');
        enterButton.setAttribute('value', 'Fetch');
        enterButton.setAttribute('id', 'enterButton');
        elements.push(enterButton);
        //End elements
        enterButton.addEventListener('click', onEnterButtonClick);
        appDiv.replaceChildren(...elements);
    }
}
function onEnterButtonClick() {
    const sortedBox = document.getElementById('sortedBox');
    if (sortedBox == null) {
        return;
    }
    const textUrl = sortedBox.value;
    if (textUrl == "") {
        alert('No URL was specified');
        return;
    }
    else {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', textUrl, true);
        xhr.responseType = 'text';
        const outputText = document.createElement('p');
        outputText.setAttribute('id', 'outputText');
        elements.push(outputText);
        if (appDiv == null) {
            return;
        }
        appDiv.replaceChildren(...elements);
        //onload and onerror code from https://javascript.info/xmlhttprequest
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            }
            else {
                let array = xhr.response.split("\n");
                let randomInt = Math.floor(Math.random() * array.length);
                console.log(array[randomInt]);
            }
        };
        xhr.onerror = function () {
            alert("Request failed");
        };
        xhr.send();
        //================================================================================================
    }
}
initialize();
