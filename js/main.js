var somRunButtonElem, citiesElem, epochsElem, learningRateElem, buttonShowsRun;

function init() {
    // Find all DOM elements
    somRunButtonElem = document.getElementById("run-button");
    citiesElem = document.getElementById("cities");
    epochsElem = document.getElementById("epochs");
    learningRateElem = document.getElementById("learningRate");

    // Make sure the button is updated when the SOM is finished
    setInterval(function(){ updateButton(); }, 100);

    // Initialize the Self-Organizing Map
    initSom();
    startSomFromCurrentConf();
    showStopButtons();
}

/**
 * This method is called when the user clicks on the SOM button.
 * If the SOM is running, it is stopped.
 * If the SOM isn't running, it is started.
 */
function clickedSomButton() {
    if (isSomRunning()) {
        stopSom();
        showRunButtons();
    } else {
        startSomFromCurrentConf();
        showStopButtons();
    }
}

function startSomFromCurrentConf() {
    var cities = citiesElem.innerText;
    var epochs = epochsElem.innerText;
    var learningRate = learningRateElem.innerText;
    startSom(cities, epochs, learningRate);
}

/**
 * Updates the button to show the stop icon when the SOM is running and
 * the run icon when the SOM isn't running.
 */
function updateButton() {

    // If the buttons shows stop, but the SOM has finished, update the button
    if (!buttonShowsRun && !isSomRunning()) {
        showRunButtons();
    }
}

/**
 * Change the button state to ready-to-run.
 */
function showRunButtons() {
    somRunButtonElem.children[0].children[0].src = "assets/run_white.png";
    somRunButtonElem.children[1].children[0].src = "assets/run_black.png";
    buttonShowsRun = true;
}

/**
 * Change the button state to stop.
 */
function showStopButtons() {
    somRunButtonElem.children[0].children[0].src = "assets/stop_white.png";
    somRunButtonElem.children[1].children[0].src = "assets/stop_black.png";
    buttonShowsRun = false;
}
