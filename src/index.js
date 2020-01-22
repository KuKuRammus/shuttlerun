import './style.css'
import { FIELD_WIDTH, FIELD_HEIGHT } from './constants/geometry'
import Game from './Game'

const game = new Game();
game.init(FIELD_WIDTH, FIELD_HEIGHT, document.querySelector('body'));
game.tick();
