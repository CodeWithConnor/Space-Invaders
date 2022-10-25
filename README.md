## Space Invaders

### How To Run

Please clone the repo and then open the index.html file in your web browser.

### About The Project

- No frameworks or canvas used, the game is implemented using plain JS/DOM and HTML only
- Game runs at **60 FPS** at all times
- No frame drops!
- Uses **RequestAnimationFrame**
- Written with performance in mind
- Pause menu, that includes:
  - Continue
  - Restart
- A score board that displays the following metrics:
  - **Timer** that indicates the amount of time the game has been running
  - **Score** that displays the current score (points)
  - **Lives** that shows the number of lives that the player has left

### Dev Tools

In order to measure performance and ensure that the code is as efficient as possible, I periodically used the developer tools to:

- Record the webpage using the performance tab, check for frame drops, check how much time each function took to execute, and other useful metrics monitoring such as the paint flashing and layer options.

## This project helped me learn about:

- [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- FPS
- DOM
- [Jank/stutter animation](https://murtada.nl/blog/going-jank-free-achieving-60-fps-smooth-websites)
- [Transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)/ [opacity](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity)
- Tasks
  - JavaScript
  - Styles
  - Layout
  - Painting
  - Compositing
- Developer Tools
  - [Firefox](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools)
  - [Chrome](https://developers.google.com/web/tools/chrome-devtools)
