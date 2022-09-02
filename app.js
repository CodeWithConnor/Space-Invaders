const grid = document.querySelector(".grid");
const resultsDisplay = document.querySelector(".results");
let currentShooterIndex = 202;
let gridWidth = 15;
let direction = 1;
let invadersId;
let goingRight = true; // default direction is right

for (let i = 0; i < 225; i++) {
    const square = document.createElement("div");
    grid.appendChild(square);
}

const squares = Array.from(document.querySelectorAll(".grid div"));

// index positions for aliens to be in
const alienInvaders = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
];

function draw() {
    for (let i = 0; i < alienInvaders.length; i++) {
        squares[alienInvaders[i]].classList.add("invader");
    }
}

draw();

function remove() {
    for (let i = 0; i < alienInvaders.length; i++) {
        squares[alienInvaders[i]].classList.remove("invader");
    }
}

squares[currentShooterIndex].classList.add("shooter");

function moveShooter(e) {
    squares[currentShooterIndex].classList.remove("shooter");
    switch (e.key) {
        case "a":
            if (currentShooterIndex % gridWidth !== 0) currentShooterIndex -= 1;
            // we know that the shooter is at the right edge of the grid
            break;
        case "d":
            if (currentShooterIndex % gridWidth < 14) currentShooterIndex += 1;
            // we know that the shooter is at the left edge of the grid
            break;
    }
    squares[currentShooterIndex].classList.add("shooter");
}
document.addEventListener("keydown", moveShooter);

function moveInvaders() {
    const leftEdge = alienInvaders[0] % gridWidth === 0;
    const rightEdge =
        alienInvaders[alienInvaders.length - 1] % gridWidth === gridWidth - 1;
    remove();

    // if invader is at right edge and going right
    if (rightEdge && goingRight) {
        // move invader down
        for (let i = 0; i < alienInvaders.length; i++) {
            // for each invader, add an entire width (15) and then -1
            alienInvaders[i] += gridWidth + 1;
            direction = -1;
            goingRight = false;
        }
    }

    // handle opposite direction
    if (leftEdge && !goingRight) {
        for (let i = 0; i < alienInvaders.length; i++) {
            alienInvaders[i] += gridWidth - 1;
            direction = 1;
            goingRight = true;
        }
    }

    // loop over each invader and assign them a different position
    for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += direction;
    }

    draw();

    // if the shooter is hit by an invader (if the div has both the invader and shooter class)
    if (squares[currentShooterIndex].classList.contains("invader", "shooter")) {
        resultsDisplay.innerHTML = "Game Over";
        // stops moving invaders
        clearInterval(invadersId);
    }
}

invadersId = setInterval(moveInvaders, 500);
