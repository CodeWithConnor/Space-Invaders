const keyLeft = 65; // A
const keyRight = 68; // D
const keySpace = 32; // Space
const gameWidth = 800;
const gameHeight = 600;
const state = {
    xPos: 0,
    yPos: 0,
    moveLeft: false,
    moveRight: false,
    shoot: false,
    lasers: [],
    spaceshipWidth: 50,
};

// General purpose functions
function setPosition($element, x, y) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
}

// used to check if player is in bounds of game div
function bound(x) {
    if (x >= gameWidth - state.spaceshipWidth) {
        state.xPos = gameWidth - state.spaceshipWidth;
        return gameWidth - state.spaceshipWidth;
    }
    if (x <= 0) {
        state.xPos = 0;
        return 0;
    } else {
        return x;
    }
}

// Player
function createPlayer($container) {
    state.xPos = gameWidth / 2;
    state.yPos = gameHeight - 50;
    const $player = document.createElement("img");
    $player.src = "img/spaceship.png";
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, state.xPos, state.yPos);
    setSize($player, state.spaceshipWidth);
}

function updatePlayer() {
    if (state.moveLeft) {
        state.xPos -= 3;
    }
    if (state.moveRight) {
        state.xPos += 3;
    }
    if (state.shoot) {
        createLaser(
            $container,
            state.xPos,
            state.spaceshipWidth / 2,
            state.yPos
        );
    }
    const $player = document.querySelector(".player");
    // ran through bound() to check if player is in bounds of game div
    setPosition($player, bound(state.xPos), state.yPos - 10);
}

function createLaser($container, x, y) {
    const $laser = document.createElement("img");
    $laser.src = "img/laser.png";
    $laser.className = "laser";
    $container.appendChild($laser);
    const laser = { x, y, $laser };
    state.lasers.push(laser);
    setPosition($laser, x, y);
}

// Responsible for moving laser across the screen
function updateLaser($container) {
    const lasers = state.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= 2;
        setPosition(laser.$laser, laser.x, laser.y);
    }
}

// Key Presses
function KeyPress(event) {
    if (event.keyCode === keyRight) {
        state.moveRight = true;
    } else if (event.keyCode === keyLeft) {
        state.moveLeft = true;
    } else if (event.keyCode === keySpace) {
        state.shoot = true;
    }
}

function KeyRelease(event) {
    if (event.keyCode === keyRight) {
        state.moveRight = false;
    } else if (event.keyCode === keyLeft) {
        state.moveLeft = false;
    } else if (event.keyCode === keySpace) {
        state.shoot = false;
    }
}

// Main update function
function update() {
    updatePlayer();
    updateLaser();
    window.requestAnimationFrame(update);
}

// Init. Game
const $container = document.querySelector(".main");
createPlayer($container);

// Key Press Event Listener
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);
update();
