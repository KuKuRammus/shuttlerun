import './style.css'
import Game from './Game'

// Canvas size Y
const FIELD_HEIGHT = window.innerHeight;

// Canvas size X
const FIELD_WIDTH = Math.min(
    Math.round(FIELD_HEIGHT * 0.56),
    window.innerWidth
);

const game = new Game();
game.init(FIELD_WIDTH, FIELD_HEIGHT, document.querySelector('body'));
game.tick();
