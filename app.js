// Keys
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;
const KEY_ESC = 27
const KEY_R = 82;

// Game properties
const GAME_WIDTH = 696;
const GAME_HEIGHT = 600;

// UI
const body = document.querySelector("body");
const banner = document.querySelector("body > div > header");
const menu = document.querySelector(".menu");
const score = document.querySelector("#score");
const enemyCount = document.querySelector("#enemy_count");
const gameStateText = document.querySelector("body > div > div.game-wrapper > div.game-finished > p");
const tutorialDiv = document.querySelector("#tutorial");
const gameWrapper = document.querySelector("body > div > div.game-wrapper");
const customisationDiv = document.querySelector("#customise");
const lives = document.querySelector("#lives");
const selected = document.querySelector("#player-wrapper > div.player.selected");
const gameFinishedDiv = document.querySelector("body > div > div.game-wrapper > div.game-finished");

// UI Visibility
tutorialVisible = true;
customisationVisible = false;

// Assets
const spaceship = document.querySelector("body > div > div.game-wrapper > div.main > img.player");
const enemies = document.querySelectorAll("body > div > div.game-wrapper > div.main > img.enemy");
const skins = document.querySelectorAll("#player-wrapper > div.player");

const GAME = {
    xPos: 0,
    yPos: 0,
    moveRight: false,
    moveLeft: false,
    shoot: false,
    lasers: [],
    enemyLasers: [],
    enemies: [],
    spaceshipWidth: 40,
    enemyWidth: 50,
    cooldown: 0,
    enemyCount: 16,
    enemyCooldown: 0,
    gameOver: false,
    gameWon: false,
    gamePaused: false,
    score: 0,
    elapsedTime: 0,
    completedTutorial: false,
    lives: 3,
    skinCount: 3,
    skins: ["pink", "yellow", "green", "blue", "purple"],
    activeSkin: "",
    gameWonSoundPlayed: false,
    gameLostSoundPlayed: false
};

function createEnemy($container, x, y) {
    const $enemy = document.createElement("img");
    $enemy.src = "img/ufo.png";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemyCooldown = Math.floor(Math.random() * 100);
    const enemy = { x, y, $enemy, enemyCooldown };
    GAME.enemies.push(enemy);
    setSize($enemy, GAME.enemyWidth);
    setPosition($enemy, x, y);
}

function updateEnemies($container) {
    if (!GAME.gamePaused) {
        const dx = Math.sin(Date.now() / 1000) * 40;
        const dy = Math.cos(Date.now() / 1000) * 30;
        const enemies = GAME.enemies;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            var a = enemy.x + dx;
            var b = enemy.y + dy;
            // If the game isn't paused
            if (!GAME.gamePaused) {
                // Update the enemy's position
                setPosition(enemy.$enemy, a, b);
            }

            enemy.cooldown = Math.random(0, 100);
            if (enemy.enemyCooldown == 0) {
                createEnemyLaser($container, a, b);
                enemy.enemyCooldown = Math.floor(Math.random() * 50) + 100;
            }
            enemy.enemyCooldown -= 0.5;
        }
    }
}

// Player
function createPlayer($container) {
    GAME.xPos = GAME_WIDTH / 2;
    GAME.yPos = GAME_HEIGHT - 50;
    const $player = document.createElement("img");
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, GAME.xPos, GAME.yPos);
    setSize($player, GAME.spaceshipWidth);
}

function updatePlayer() {
    if (GAME.moveLeft) {
        GAME.xPos -= 3;
    }
    if (GAME.moveRight) {
        GAME.xPos += 3;
    }
    // Only shoot if cooldown is 0 and game is not over
    if (GAME.shoot && GAME.cooldown == 0 && !GAME.gameOver) {
        createLaser($container, GAME.xPos - GAME.spaceshipWidth / 2, GAME.yPos);
        GAME.cooldown = 30;
    }
    const $player = document.querySelector(".player");
    setPosition($player, bound(GAME.xPos), GAME.yPos - 10);
    if (GAME.cooldown > 0) {
        GAME.cooldown -= 0.5;
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
    GAME.lasers.push(laser);
    setPosition($laser, x, y);
}

function updateLaser($container) {
    const lasers = GAME.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= 8; // Laser speed
        if (laser.y < 0) {
            deleteLaser(lasers, laser, laser.$laser);
        }
        setPosition(laser.$laser, laser.x, laser.y);
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = GAME.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            // Check for collision between ufo/laser if game not over
            if (collisionDetected(enemy_rectangle, laser_rectangle) && !GAME.gameOver) {
                playSound("ufo_hit");
                deleteLaser(lasers, laser, laser.$laser);
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy);
                GAME.score++;
                score.innerHTML = GAME.score;
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
    GAME.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}

function updateEnemyLaser($container) {
    const enemyLasers = GAME.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 4; // Enemy laser speed
        if (enemyLaser.y > GAME_HEIGHT - 30) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
        }
        const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
        // If there is a collision between spaceship and enemy laser
        if (collisionDetected(spaceship_rectangle, enemyLaser_rectangle)) {
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
            // deduct a life
            if (GAME.lives >= 2) {
                playSound("lose_life");
            }
            GAME.lives--;
            lives.innerHTML = GAME.lives;
            // When there is only 1 life left
            if (GAME.lives == 0) {
                // End the game
                GAME.gameOver = true;
                setTimeout(() => {
                    window.location.reload();
                }, 2650);
            }
        }
        setPosition(enemyLaser.$enemyLaser, enemyLaser.x + GAME.enemyWidth / 2, enemyLaser.y + 15);
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

function playSound(file) {
    const audio = new Audio("sounds/" + file + ".wav");
    audio.play();
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
    if (x >= GAME_WIDTH - GAME.spaceshipWidth) {
        GAME.xPos = GAME_WIDTH - GAME.spaceshipWidth;
        return GAME_WIDTH - GAME.spaceshipWidth;
    }
    if (x <= 0) {
        GAME.xPos = 0;
        return 0;
    } else {
        return x;
    }
}

// Returns true if collision is detected
function collisionDetected(rect1, rect2) {
    // Checks first if game is still in progress
    if (!GAME.gameOver && !GAME.gameWon) {
        // collision will equal true only if collision is detected
        var collision = !(rect2.left > rect1.right || rect2.right < rect1.left || rect2.top > rect1.bottom || rect2.bottom < rect1.top);
        // Checking if collision is true first before returning avoids continuous collision detection spam
        if (collision) {
            return true;
        }
    }
}

function updatePlayerSkin(direction) {
    if (customisationDiv.style.opacity == "1") {
        if (direction == "left") {
            GAME.skinCount--;
            // Check all divs and remove selected class if it's found
            for (let i = 0; i < GAME.skins.length; i++) {
                // Check if div has selected class
                if (document.querySelector("#player-wrapper > div.player." + GAME.skins[i] + "").classList.contains("selected")) {
                    document.querySelector("#player-wrapper > div.player." + GAME.skins[i] + "").classList.remove("selected");
                }
            }

            // Add selected class to new skin div
            document.querySelector("#player-wrapper > div.player." + GAME.skins[GAME.skinCount - 1] + "").classList.add("selected");
        } else {
            GAME.skinCount++;

            // Check all divs and remove selected class if it's found
            for (let i = 0; i < GAME.skins.length; i++) {
                // Check if div has selected class
                if (document.querySelector("#player-wrapper > div.player." + GAME.skins[i] + "").classList.contains("selected")) {
                    document.querySelector("#player-wrapper > div.player." + GAME.skins[i] + "").classList.remove("selected");
                }
            }

            // Add selected class to new skin div
            document.querySelector("#player-wrapper > div.player." + GAME.skins[GAME.skinCount - 1] + "").classList.add("selected");
        }
    }
}

// Key Presses
function KeyPress(event) {
    if (event.keyCode === KEY_LEFT) {
        if (customisationDiv.style.opacity != "0") {
            if (GAME.skinCount !== 1) {
                updatePlayerSkin("left");
            }
        } else {
            GAME.moveLeft = true;
        }
    } else if (event.keyCode === KEY_RIGHT) {
        if (customisationDiv.style.opacity != "0") {
            if (GAME.skinCount !== 5) {
                updatePlayerSkin("right");
            }
        } else {
            GAME.moveRight = true;
        }
    } else if (event.keyCode === KEY_SPACE) {
        // Show customisation div if tutorial div is visible
        if (tutorialDiv.style.opacity != "0") {
            showCustomisation();
        } else if (customisationDiv.style.opacity != "0") {
            startGame();
        } else {
            GAME.shoot = true;
        }
    } else if (event.keyCode === KEY_ESC) {
        // only pause if user has completed tutorial
        if (GAME.completedTutorial && !GAME.gamePaused) {
            GAME.gamePaused = true;
            menu.style.opacity = "1";
        } else {
            GAME.gamePaused = false;
            menu.style.opacity = "0";
        }
    } else if (event.keyCode === KEY_R) {
        // only unpause if user has completed tutorial
        if (GAME.completedTutorial && GAME.gamePaused) {
            window.location.reload();
        }
    }
}

function KeyRelease(event) {
    if (event.keyCode === KEY_RIGHT) {
        GAME.moveRight = false;
    } else if (event.keyCode === KEY_LEFT) {
        GAME.moveLeft = false;
    } else if (event.keyCode === KEY_SPACE) {
        GAME.shoot = false;
    }
}

function hideAllEntities($container) {
    // Delete all enemy ufos
    const enemies = GAME.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        deleteLaser(enemies, enemy, enemy.$enemy);
    }

    // Delete all enemy lasers
    const enemyLasers = GAME.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++) {
        const enemyLaser = enemyLasers[i];
        deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser);
    }

    // Delete all friendly lasers
    const lasers = GAME.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        deleteLaser(lasers, laser, laser.$laser);
    }

    // Hide pause menu, spaceship, banner and game window
    menu.style.opacity = "0";
    document.querySelector("img.player").style.opacity = "0";
    document.querySelector("body > div > header").style.display = "none";
    document.querySelector("body > div > div > div.main").style.display = "none";
}

function showGameText(result) {
    if (result == "win") {
        gameStateText.innerHTML = "YOU WIN!";
        gameFinishedDiv.style.display = "flex";
    } else if (result == "lose") {
        gameStateText.innerHTML = "GAME OVER";
        gameFinishedDiv.style.display = "flex";
    }
}

function gameComplete(result) {
    if (!GAME.gameWonSoundPlayed && result == "win") {
        playSound("win");
        // confetti({
        //     particleCount: 100,
        //     spread: 70,
        //     origin: {
        //         y: 0.6
        //     }
        // });
        GAME.gameWonSoundPlayed = true;
    } else if (!GAME.gameLostSoundPlayed && result == "lose") {
        playSound("game_over");
        GAME.gameLostSoundPlayed = true;
    }

    if (result == "win") {
        hideAllEntities();
        showGameText(result);
        setTimeout(() => {
            window.location.reload();
        }, 4950);
    } else if (result == "lose") {
        hideAllEntities();
        showGameText(result);
    }
}

// Main Update Function
function update() {
    if (!GAME.gamePaused && !tutorialVisible && !customisationVisible) {
        updatePlayer();
        updateEnemies($container);
        updateLaser($container);
        updateEnemyLaser($container);
    }

    window.requestAnimationFrame(update);

    if (GAME.gameOver) {
        gameComplete("lose");
    }
    // Check if all ufos are destroyed and it's not game over
    if (GAME.enemies.length == 0 && !GAME.gameOver) {
        gameComplete("win");
    }
}

function createEnemies($container) {
    for (var i = 0; i < GAME.enemyCount / 2; i++) {
        createEnemy($container, i * 80, 100);
    }
    for (var i = 0; i < GAME.enemyCount / 2; i++) {
        createEnemy($container, i * 80, 180);
    }
}

function showCustomisation() {
    tutorialDiv.style.opacity = "0";
    customisationDiv.style.opacity = "1";
    tutorialVisible = false;
    customisationVisible = true;
}

var lastTime = new Date().getTime();
var displayNode = document.getElementById("display");
var seconds = -1;
var minutes = 0;
var hours = 0;

function timer() {
    window.requestAnimationFrame(timer);

    // Only start the timer if: tutorial is complete, customisation is complete and game is not paused
    if (!GAME.gamePaused) {
        var currentTime = new Date().getTime();

        if (currentTime - lastTime >= 1000) {
            lastTime = currentTime;
            seconds++;

            // If second is less than 1 minute (10 seconds)
            if (seconds < 60) {
                if (seconds < 10) {
                    document.querySelector("#sec").innerText = "0" + seconds;
                } else {
                    document.querySelector("#sec").innerText = seconds;
                }
            } else {
                seconds = 0;
                document.querySelector("#sec").innerText = "00";
                minutes++;

                if (minutes < 60) {
                    if (minutes < 10) {
                        document.querySelector("#min").innerText = "0" + minutes;
                    } else {
                        document.querySelector("#min").innerText = minutes;
                    }
                }
            }
        }
    }
}

function startGame() {
    customisationVisible = false;

    // Set player skin
    for (let i = 0; i < GAME.skins.length; i++) {
        // Check which div has selected class
        if (document.querySelector("#player-wrapper > div.player." + GAME.skins[i] + "").classList.contains("selected")) {
            // Set activeSkin to div with selected class
            GAME.activeSkin = GAME.skins[i];
        }
    }
    document.querySelector("body > div > div.game-wrapper > div.main > img.player").src = "img/spaceship-" + GAME.activeSkin + ".png";

    // Hide customisation div and show banner, game div, enemy/players
    GAME.completedTutorial = true;
    customisationDiv.style.opacity = "0";
    banner.style.display = "block";
    gameWrapper.style.opacity = "1";
    for (var i = 0; i < GAME.enemyCount; i++) {
        document.querySelectorAll("img.enemy")[i].style.opacity = "1";
    }
    document.querySelector("img.player").style.opacity = "1";
    // Start timer
    timer();
}

// Initialize the Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);
enemyCount.innerHTML = GAME.enemyCount;

// Key Press Event Listener
body.addEventListener("keydown", KeyPress);
body.addEventListener("keyup", KeyRelease);

update();
