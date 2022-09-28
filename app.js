// Keys
const KEY_RIGHT = 68;
const KEY_LEFT = 65;
const KEY_SPACE = 32;
const KEY_ESC = 27;
const KEY_R = 82;

// Game properties
const GAME_WIDTH = 696;
const GAME_HEIGHT = 600;

// Timer
var sec = 0,
    min = 1,
    hour = 1;
var secVar, minVar, hourVar;

// UI
const banner = document.querySelector("body > div > header");
const menu = document.querySelector(".menu");
const score = document.querySelector("#score");
const enemyCount = document.querySelector("#enemy_count");
const gameStateText = document.querySelector("body > div > div > p");
const tutorialDiv = document.querySelector("#tutorial");
const gameWrapper = document.querySelector("body > div > div.game-wrapper");
const customisationDiv = document.querySelector("#customise");
const lives = document.querySelector("#lives");

// Assets
const spaceship = document.querySelector("body > div > div.game-wrapper > div.main > img.player");

function playSound(file) {
    const audio = new Audio("sounds/" + file + ".wav");
    audio.play();
}

const STATE = {
    x_pos: 0,
    y_pos: 0,
    move_right: false,
    move_left: false,
    shoot: false,
    lasers: [],
    enemyLasers: [],
    enemies: [],
    spaceship_width: 40,
    enemy_width: 50,
    cooldown: 0,
    number_of_enemies: 16,
    enemy_cooldown: 0,
    gameOver: false,
    gameWon: false,
    gamePaused: false,
    score: 0,
    elapsedTime: 0,
    completedTutorial: false,
    lives: 3
};

// Timer functions
function setSec() {
    if (!STATE.gamePaused) {
        if (sec >= 60) {
            setMin();
            sec = 0;
        }
        if (sec < 10) {
            document.getElementById("sec").innerHTML = "0" + sec;
        } else {
            document.getElementById("sec").innerHTML = sec;
        }
        sec = sec + 1;
    }

    secVar = setTimeout(setSec, 1000);
}
function setMin() {
    if (!STATE.gamePaused) {
        if (min >= 60) {
            setHour();
            min = 0;
        }
        if (min < 10) {
            document.getElementById("min").innerHTML = "0" + min;
        } else {
            document.getElementById("min").innerHTML = min;
        }
        min = min + 1;
    }
}
function setHour() {
    if (!STATE.gamePaused) {
        if (hour < 10) {
            document.getElementById("hour").innerHTML = "0" + hour;
        } else {
            document.getElementById("hour").innerHTML = hour;
        }
        hour = hour + 1;
    }
}

// General purpose functions
function setPosition($element, x, y) {
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
}

function bound(x) {
    if (x >= GAME_WIDTH - STATE.spaceship_width) {
        STATE.x_pos = GAME_WIDTH - STATE.spaceship_width;
        return GAME_WIDTH - STATE.spaceship_width;
    }
    if (x <= 0) {
        STATE.x_pos = 0;
        return 0;
    } else {
        return x;
    }
}

// Returns true if collision is detected
function collideRect(rect1, rect2) {
    // Checks first if game is still in progress
    if (!STATE.gameOver && !STATE.gameWon) {
        // collision will equal true only if collision is detected
        var collision = !(
            rect2.left > rect1.right ||
            rect2.right < rect1.left ||
            rect2.top > rect1.bottom ||
            rect2.bottom < rect1.top
        );
        // Checking if collision is true first before returning avoids continuous collision detection spam
        if (collision) {
            console.log("returned true");
            return true;
        }
    }
}

function createEnemy($container, x, y) {
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.svg";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random() * 100);
    const enemy = { x, y, $enemy, enemy_cooldown };
    STATE.enemies.push(enemy);
    setSize($enemy, STATE.enemy_width);
    setPosition($enemy, x, y);
}

function updateEnemies($container) {
    if (!STATE.gamePaused) {
        const dx = Math.sin(Date.now() / 1000) * 40;
        const dy = Math.cos(Date.now() / 1000) * 30;
        const enemies = STATE.enemies;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            var a = enemy.x + dx;
            var b = enemy.y + dy;
            // If the game isn't paused
            if (!STATE.gamePaused) {
                // Update the enemy's position
                setPosition(enemy.$enemy, a, b);
            }
            enemy.cooldown = Math.random(0, 100);
            if (enemy.enemy_cooldown == 0) {
                createEnemyLaser($container, a, b);
                enemy.enemy_cooldown = Math.floor(Math.random() * 50) + 100;
            }
            enemy.enemy_cooldown -= 0.5;
        }
    }
}

// Player
function createPlayer($container) {
    STATE.x_pos = GAME_WIDTH / 2;
    STATE.y_pos = GAME_HEIGHT - 50;
    const $player = document.createElement("img");
    $player.src = "img/spaceship.svg";
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, STATE.x_pos, STATE.y_pos);
    setSize($player, STATE.spaceship_width);
}

function updatePlayer() {
    if (STATE.move_left) {
        STATE.x_pos -= 3;
    }
    if (STATE.move_right) {
        STATE.x_pos += 3;
    }
    // Only shoot if cooldown is 0 and game is not over
    if (STATE.shoot && STATE.cooldown == 0 && !STATE.gameOver) {
        createLaser($container, STATE.x_pos - STATE.spaceship_width / 2, STATE.y_pos);
        STATE.cooldown = 30;
    }
    const $player = document.querySelector(".player");
    setPosition($player, bound(STATE.x_pos), STATE.y_pos - 10);
    if (STATE.cooldown > 0) {
        STATE.cooldown -= 0.5;
    }
}

// Player Laser
function createLaser($container, x, y) {
    playSound("bullet");
    const $laser = document.createElement("img");
    $laser.src = "img/laser.png";
    $laser.className = "laser";
    $container.appendChild($laser);
    const laser = { x, y, $laser };
    STATE.lasers.push(laser);
    setPosition($laser, x, y);
}

function updateLaser($container) {
    const lasers = STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= 5; // Laser speed
        if (laser.y < 0) {
            deleteLaser(lasers, laser, laser.$laser);
        }
        setPosition(laser.$laser, laser.x, laser.y);
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            // Check for collision between ufo/laser if game not over
            if (collideRect(enemy_rectangle, laser_rectangle) && !STATE.gameOver) {
                playSound("ufo_hit");
                deleteLaser(lasers, laser, laser.$laser);
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy);
                STATE.score++;
                score.innerHTML = STATE.score;
            }
        }
    }
}

// Enemy Laser
function createEnemyLaser($container, x, y) {
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "img/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    $container.appendChild($enemyLaser);
    const enemyLaser = { x, y, $enemyLaser };
    STATE.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}

function updateEnemyLaser($container) {
    const enemyLasers = STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 4; // Enemy laser speed
        if (enemyLaser.y > GAME_HEIGHT - 30) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
        }
        const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
        // If there is a collision between spaceship and enemy laser
        if (collideRect(spaceship_rectangle, enemyLaser_rectangle)) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
            // deduct a life
            if (STATE.lives >= 2) {
                playSound("lose_life");
            }
            STATE.lives--;
            lives.innerHTML = STATE.lives;
            // When there is only 1 life left
            if (STATE.lives == 0) {
                // End the game
                playSound("game_over");
                STATE.gameOver = true;
                setTimeout(restartGame, 2650);
            }
        }
        setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width / 2, enemyLaser.y + 15);
    }
}

// Delete Laser
function deleteLaser(lasers, laser, $laser) {
    const index = lasers.indexOf(laser);
    if (index !== -1) {
        lasers.splice(index, 1);
        $container.removeChild($laser);
    }
}

// Key Presses
function KeyPress(event) {
    if (event.keyCode === KEY_RIGHT) {
        STATE.move_right = true;
    } else if (event.keyCode === KEY_LEFT) {
        STATE.move_left = true;
    } else if (event.keyCode === KEY_SPACE) {
        // Show customisation div if tutorial div is visible
        if (tutorialDiv.style.display != "none") {
            console.log("tutorial is visible");
            showCustomisation();
        } else if (customisationDiv.style.display != "none") {
            startGame();
        } else {
            STATE.shoot = true;
        }
    } else if (event.keyCode === KEY_ESC) {
        // only pause if user has completed tutorial
        if (STATE.completedTutorial && !STATE.gamePaused) {
            STATE.gamePaused = true;
            menu.style.display = "block";
        } else {
            console.log("game paused is false");
            STATE.gamePaused = false;
            menu.style.display = "none";
        }
    } else if (event.keyCode === KEY_R) {
        // only unpause if user has completed tutorial
        if (STATE.completedTutorial && STATE.gamePaused) {
            restartGame();
        }
    }
}

function KeyRelease(event) {
    if (event.keyCode === KEY_RIGHT) {
        STATE.move_right = false;
    } else if (event.keyCode === KEY_LEFT) {
        STATE.move_left = false;
    } else if (event.keyCode === KEY_SPACE) {
        STATE.shoot = false;
    }
}

function hideAllEntities($container) {
    hidePauseMenu();

    // Delete all enemy ufos
    const enemies = STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        deleteLaser(enemies, enemy, enemy.$enemy);
    }

    // Delete all enemy lasers
    const enemyLasers = STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
    }

    // Delete all friendly lasers
    const lasers = STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        deleteLaser(lasers, laser, laser.$laser);
    }

    // Hide spaceship, banner and game window
    document.querySelector("img.player").style.display = "none";
    document.querySelector("body > div > header").style.display = "none";
    document.querySelector("body > div > div > div.main").style.display = "none";
}

function gameWon() {
    // only proceed if game is not already over (avoids func call from collisions after game has already ended)
    if (!STATE.gameOver) {
        playSound("win");
        hideAllEntities();
        gameWon = true;

        // Set and display p tag
        gameStateText.innerHTML = "YOU WIN!";
        gameStateText.style.display = "block";

        confetti({
            particleCount: 100,
            spread: 70,
            origin: {
                y: 0.6
            }
        });

        // Send user back to main menu after 4.95 seconds
        setTimeout(restartGame, 4950);
    }
}

function gameLost() {
    if (!STATE.gameWon) {
        hideAllEntities();
        gameStateText.innerHTML = "GAME OVER";
        gameStateText.style.display = "block";
    }
}

// Main Update Function
function update() {
    if (!STATE.gamePaused && tutorialDiv.style.display === "none" && customisationDiv.style.display === "none") {
        updatePlayer();
        updateEnemies($container);
        updateLaser($container);
        updateEnemyLaser($container);
    }

    window.requestAnimationFrame(update);

    if (STATE.gameOver) {
        gameLost();
    }
    // Check if all ufos are destroyed and it's not game over
    if (STATE.enemies.length == 0 && !STATE.gameOver) {
        gameWon();
    }
}

function restartGame() {
    window.location.reload();
}

function hidePauseMenu() {
    menu.style.display = "none";
}

function createEnemies($container) {
    for (var i = 0; i < STATE.number_of_enemies / 2; i++) {
        createEnemy($container, i * 80, 100);
    }
    for (var i = 0; i < STATE.number_of_enemies / 2; i++) {
        createEnemy($container, i * 80, 180);
    }
}

function showCustomisation() {
    // Hide tutorial div and show customisation div
    tutorialDiv.style.display = "none";
    customisationDiv.style.display = "flex";
}

function startGame() {
    // Hide customisation div and show banner/game div
    STATE.completedTutorial = true;
    customisationDiv.style.display = "none";
    banner.style.display = "block";
    gameWrapper.style.display = "flex";
    // Start timer
    setSec();
}

// Initialize the Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);
enemyCount.innerHTML = STATE.number_of_enemies;

// Key Press Event Listener
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);

update();
