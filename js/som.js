var canvas;
var stage;

// Graphics
var cityRadius = 5;
var nodeRadius = 3;

// Self-Organizing Map, SOM
var isRunning = false;
var numCities;
var numNodes;
var cities = []; // city positions
var drawableNodes = []; // the node shape objects
var drawableLines = [];
var W = []; // the node positions
var maxEpochs;
var currentEpoch;
var learningRate;

var color = {
    RED : "#FF0000",
    GREEN : "#00FF00",
    BLUE : "#0000FF",
    WHITE : "#FFFFFF",
    BLACK : "#424242",
    GRAY: "#6B6B6B"
};

/**
 * Prepare the SOM from the HTML document
 */
function initSom() {

    canvas = document.getElementById("som-canvas");
    stage = new createjs.Stage(canvas);
    createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;
    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.addEventListener("tick", tick);

    window.addEventListener('resize', resizeCanvas, false);

    // Make sure that the canvas fills the entire window
    resizeCanvas();
}

/**
 * Resizes the SOM canvas to the window size. This is required in order to dynamically resize the canvas.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * The main epoch loop that updated the positions of the nodes.
 */
function tick(event) {

    if (isRunning) {
        currentEpoch++;
        epoch(currentEpoch);

        // Stop when we've reached the maximum number of epochs
        if (currentEpoch == maxEpochs) {
            isRunning = false;
        }
    }

    stage.update(event);
}

/**
 * Resets the SOM and all its graphics.
 */
function clearSom() {

    // Reset parameters
    numCities = 0;
    numNodes = 0;
    cities = [];
    drawableNodes = [];
    drawableLines = [];
    W = [];
    maxEpochs = 0;
    currentEpoch = 0;
    learningRate = 0.0;

    // Remove graphics
    stage.removeAllChildren();
    stage.update();
}

/**
 * Updates the positions of the nodes given the current epoch number.
 * @param currentEpoch Current epoch number
 */
function epoch(currentEpoch) {

    // Randomize the order of the cities and loop through them
    var rndCityIndices = shuffleArray(Array.apply(null, { length: numCities }).map(Number.call, Number));

    for (var i = 0; i < numCities; i++) {

        var city = cities[rndCityIndices[i]];
        var winningNodeIdx = euclideanDistance(W, city);

        for (var nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {

            var theta =  neighborhoodGaussian(winningNodeIdx, nodeIdx, currentEpoch, numNodes);
            W[nodeIdx][0] = W[nodeIdx][0] + theta * learningRate * (city[0] - W[nodeIdx][0]);
            W[nodeIdx][1] = W[nodeIdx][1] + theta * learningRate * (city[1] - W[nodeIdx][1]);

            var nodeShape = drawableNodes[nodeIdx];
            nodeShape.x = W[nodeIdx][0];
            nodeShape.y = W[nodeIdx][1];
        }
    }

    // Update line graphics
    for (var lineIdx = 1; lineIdx < drawableLines.length; lineIdx++) {
        updateLine(drawableLines[lineIdx - 1], W[lineIdx - 1][0], W[lineIdx - 1][1], W[lineIdx][0], W[lineIdx][1]);
    }

    // Update the final line. This call is required since the graph is circular
    updateLine(drawableLines[numNodes - 1], W[numNodes - 1][0], W[numNodes - 1][1], W[0][0], W[0][1]);
}

/**
 * Draws a city shape at the given coordinate and returns the shape object.
 * @param x The x coordinate of the city
 * @param y The y coordinate of the city
 * @returns The city shape object
 */
function drawCity (x, y) {

    var shape = new createjs.Shape();
    shape.snapToPixel = true;
    shape.x = x;
    shape.y = y;
    shape.graphics.beginFill(color.BLACK).drawCircle(0, 0, cityRadius);
    shape.cache(-cityRadius, -cityRadius, cityRadius * 2, cityRadius * 2);

    stage.addChild(shape);

    return shape;
}

/**
 * Draws a node shape at the given coordinate and returns the shape object.
 * @param x The x coordinate of the node
 * @param y The y coordinate of the node
 * @returns The node shape object
 */
function drawNode(x, y) {

    var shape = new createjs.Shape();
    shape.x = x;
    shape.y = y;
    shape.graphics.beginFill(color.GRAY).drawCircle(0, 0, nodeRadius);
    shape.snapToPixel = true;
    shape.cache(-nodeRadius, -nodeRadius, nodeRadius * 2, nodeRadius * 2);

    stage.addChild(shape);

    return shape;
}

/**
 * Draws a line from and to the given coordinates and returns the line object.
 * @param fromX The x coordinate of the start coordinate
 * @param fromY The y coordinate of the start coordinate
 * @param toX The x coordinate of the end coordinate
 * @param toY The y coordinate of the end coordinate
 * @returns The line object
 */
function drawLine(fromX, fromY, toX, toY) {

    var line = new createjs.Shape();
    updateLine(line, fromX, fromY, toX, toY);
    stage.addChild(line);

    return line;
}

/**
 * Updates the internal position of the given line.
 * @param line The line object to update
 * @param fromX The x coordinate of the start coordinate
 * @param fromY The y coordinate of the start coordinate
 * @param toX The x coordinate of the end coordinate
 * @param toY The y coordinate of the end coordinate
 */
function updateLine(line, fromX, fromY, toX, toY) {

    line.graphics.clear();
    line.graphics.alpha = 1.0;
    line.graphics.setStrokeStyle(1);
    line.graphics.beginStroke(color.GRAY);
    line.graphics.moveTo(fromX, fromY);
    line.graphics.lineTo(toX, toY);
    line.graphics.endStroke();
}

/**
 * Starts the SOM with the given configuration.
 * @param confNumCities The number of cities to visit
 * @param numEpochs The number of epocs to to run the SOM
 * @param confLearningRate The initial learning rate
 */
function startSom(confNumCities, numEpochs, confLearningRate) {

    clearSom();

    numCities = confNumCities;
    learningRate = confLearningRate;

    currentEpoch = 0;
    maxEpochs = numEpochs;

    // Draw random cities
    for (var i = 0; i < numCities; i++) {
        var x = Math.random() * canvas.width;
        var y = Math.random() * canvas.height;
        drawCity(x, y);
    }

    numNodes = numCities * 2;

    // Save the positions of the cities from the stage
    for (var i = 0; i < numCities; i++) {
        var city = stage.getChildAt(i);
        cities[i] = [];
        cities[i][0] = city.x;
        cities[i][1] = city.y;
    }

    // Initialize nodes to random positions in the stage
    for (var i = 0; i < numNodes; i++) {
        W[i] = [];
        W[i][0] = Math.random() * canvas.width;
        W[i][1] = Math.random() * canvas.height;
        drawableNodes[i] = drawNode(W[i][0], W[i][1]);

        if (i > 0) {
            drawableLines[i - 1] = drawLine(W[i - 1][0], W[i - 1][1], W[i][0], W[i][1]);
        }
    }

    drawableLines[numNodes - 1] = drawLine(W[numNodes - 1][0], W[numNodes - 1][1], W[0][0], W[0][1]);

    isRunning = true;
}

/**
 * Computes theta, the degree of which the nodes weight is to be adjusted, based on
 * the distances between nodes in a cyclic manner, meaning that the first and
 * the last nodes aren't necessary far away from each other.
 * @param winningNodeIdx An index of the node that is closest to the current city
 * @param nodeIdx An index of a node for which theta is to be computed
 * @param epoch Current epoch number
 * @param numNodes Number of total nodes
 * @returns {number} Degree of weight adjustment for the given node
 */
function neighborhoodGaussian(winningNodeIdx, nodeIdx, epoch, numNodes) {

    var distanceClockwise = Math.abs(winningNodeIdx - nodeIdx);
    var distanceAntiClockwise = numNodes - distanceClockwise;
    var distance  = Math.min(distanceClockwise, distanceAntiClockwise);
    var theta = Math.exp(-(Math.pow(distance, 2) / (numNodes / Math.pow(0.01 * epoch, 2))));

    return theta;
}

/**
 * Finds the index of the node that is closest to the current city.
 * The distance is measured in Euclidean space.
 * @param W The weight matrix containing all node positions
 * @param city Current city
 * @returns {number} Index of the node closet to the current city
 */
function euclideanDistance(W, city) {

    var winningNodeIdx = -1;
    var winningDistance = Number.MAX_VALUE;
    var numNodes = W.length;

    for (var nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        var nodePosition = W[nodeIdx];
        var distanceVec = [city[0] - nodePosition[0], city[1] - nodePosition[1]];
        var distance = Math.sqrt(Math.pow(distanceVec[0], 2) + Math.pow(distanceVec[1], 2));

        if (distance < winningDistance) {
            winningNodeIdx = nodeIdx;
            winningDistance = distance;
        }
    }

    return winningNodeIdx;
}

/**
 * Randomly shuffles the given array and returns it.
 * @param array An array that is to be shuffled
 * @returns {*} The shuffled array
 */
function shuffleArray(array) {

    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

/**
 * Changes the state of the SOM isRunning flag to false.
 */
function stopSom() {
    isRunning = false;
}

/**
 * Return true if the SOM is running, false otherwise
 */
function isSomRunning() {
    return isRunning;
}
