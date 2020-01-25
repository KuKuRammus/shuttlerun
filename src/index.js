import './style.css'
import Game from './Game'

// Canvas size Y
const FIELD_HEIGHT = window.innerHeight;

// Canvas size X
const FIELD_WIDTH = Math.min(
    Math.round(FIELD_HEIGHT * 0.56),
    window.innerWidth
);

// Detect if using mobile device
const MOBILE_DEVICE = (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
);

const game = new Game();
game.init(FIELD_WIDTH, FIELD_HEIGHT, document.querySelector('body'), MOBILE_DEVICE !== null);
game.tick();
