import { Howl, Howler } from 'howler'

// Resources / Sound / Hit
import soundHitLeft from './media/sounds/hit/left.mp3'
import soundHitRight from './media/sounds/hit/right.mp3'

// Load song and beatmap info
import songFile from './media/song/song.mp3'
import songInfo from './media/song/songinfo'

class Game
{
    // Game state
    STATE_INIT = 0;
    STATE_RUN = 1;
    state = 0;

    // Canvas drawing 2D context
    /** @type {RenderingContext|null} canvasCtx */
    canvasCtx = null;
    canvasWidth = 0;
    canvasHeight = 0;

    currentTime = 0;
    lastTime = 0;

    // Misc
    radianToDegree = 180 / Math.PI;
    degreeToRadian = Math.PI / 180;

    // Orbit properties
    orbit = {
        center: {
            x: 0.0,
            y: 0.0
        },
        radius: 0.0,
        thickness: 3,
        color: '#272727'
    };

    // Shuttle properties
    shuttle = {
        direction: -1,
        radius: 0.0,
        angle: 0.0,
        speed: 37.5,
        color: '#009fb7',
        angularSize: 0.0
    };

    // Obstacle
    obstacle = {
        minimalOffsetFromShuttle: Math.PI / 2.5,
        color: '#e31919',
        angle: 0.0,
        dimensions: {
            x: 0.0,
            y: 0.0
        }
    };

    // Hitboxes
    noteblock = {
        color: {
            left: '#ccc',
            right: '#ddd'
        },
        size: { x: 0, y: 0 }
    };

    // Scoreboard
    scoreboard = {
        position: {
            x: 0.0,
            y: 0.0
        },
        fontStyle: '',
        color: '#272727',
        text: '',
        score: 0
    };

    // Sounds
    sound = {
        hit: {
            left: null,
            right: null
        },
        settings: {
            volume: 0.15
        }
    };

    // Internal stopwatch
    stopwatch = 0;

    // Loaded song
    beatmap = {
        audio: null,
        info: null
    };

    constructor() {}

    init(width, height, rootElement) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // Create play field
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        rootElement.appendChild(canvas);

        // Save reference to drawing context
        this.canvasCtx = canvas.getContext('2d');

        // Calculate orbit position and diameter
        this.orbit.center.x = Math.round(width / 2);
        this.orbit.center.y = Math.round(height * 0.3);
        this.orbit.radius = Math.round((width * 0.7) / 2);

        // Calculate shuttle size (+ angular size) and set initial position
        this.shuttle.angle = 90.0 * this.degreeToRadian;
        this.shuttle.radius = Math.round((width * 0.063) / 2);
        this.shuttle.angularSize = (this.shuttle.radius * 2 * 47) / this.orbit.radius * this.degreeToRadian;

        // Calculate note block size
        this.noteblock.size.x = this.orbit.radius * 0.15;
        this.noteblock.size.y = this.orbit.radius * 0.15;

        // Calculate scoreboard position
        this.scoreboard.position.x = this.orbit.center.x;
        this.scoreboard.position.y = this.orbit.center.y + Math.round(this.orbit.radius * 0.16 / 3);
        this.scoreboard.fontStyle = `${Math.round(this.orbit.radius * 0.16)}px Overpass Mono`;
        this.scoreboard.text = 'no collision';

        // Create obstacle
        this.generateObstacle();

        // Load sounds
        this.sound.hit.left = new Howl({ src: [soundHitLeft], volume: this.sound.settings.volume });
        this.sound.hit.right = new Howl({ src: [soundHitRight], volume: this.sound.settings.volume });

        // Load song info
        this.beatmap.audio = new Howl({ src: [songFile], volume: this.sound.settings.volume - 0.1 });
        this.beatmap.info = songInfo;

        this.shuttle.speed = 6000 / this.beatmap.info.meta.bpm;

        // Register handle for keyboard events
        window.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    }

    handleKeydownEvent(event) {
        if (!event.repeat) {
            switch (event.code) {
                case 'ArrowLeft': {
                    this.sound.hit.left.play();
                } break;

                case 'ArrowRight': {
                    this.sound.hit.right.play();
                } break;
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    tick() {
        window.requestAnimationFrame(this.tick.bind(this));

        this.currentTime = (new Date()).getTime();
        if (this.lastTime === 0) {
            this.lastTime = (new Date()).getTime();
        }
        const deltaTime = (this.currentTime - this.lastTime) / 1000;

        this.update(deltaTime);
        this.render(deltaTime);

        this.lastTime = this.currentTime;
    }

    generateObstacle() {
        const randomOffset = this.obstacle.minimalOffsetFromShuttle + (Math.random() * Math.PI / 2);
        this.obstacle.angle = ((this.shuttle.angle + (randomOffset * this.shuttle.direction)) % (Math.PI * 2));
    }

    update(deltaTime) {
        this.shuttle.angle += ((this.shuttle.speed * deltaTime) * this.shuttle.direction) * this.degreeToRadian;

        if (this.state === this.STATE_INIT && (this.shuttle.angle < Math.PI / 2 * -1)) {
            this.state = this.STATE_RUN;
            // this.beatmap.audio.play();
        }

        if (this.state === this.STATE_RUN) {
            this.stopwatch += deltaTime;
        }
    }

    render(deltaTime) {
        // Clear
        this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Render orbit
        this.canvasCtx.lineWidth = this.orbit.thickness;
        this.canvasCtx.strokeStyle = this.orbit.color;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(
            this.orbit.center.x,
            this.orbit.center.y,
            this.orbit.radius,
            0,
            Math.PI * 2
        );
        this.canvasCtx.stroke();

        // Render noteblock
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = this.noteblock.color.left;
        this.canvasCtx.beginPath();
        this.canvasCtx.translate(
            this.orbit.center.x + Math.cos(this.obstacle.angle) * this.orbit.radius,
            this.orbit.center.y + Math.sin(this.obstacle.angle) * this.orbit.radius
        );
        this.canvasCtx.rotate(this.obstacle.angle);
        this.canvasCtx.rect(
            0 - this.noteblock.size.x / 2,
            0 - this.noteblock.size.y / 2,
            this.noteblock.size.x,
            this.noteblock.size.y
        );
        this.canvasCtx.fill();
        this.canvasCtx.restore();

        // Render shuttle
        this.canvasCtx.fillStyle = this.shuttle.color;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(
            this.orbit.center.x + Math.cos(this.shuttle.angle) * this.orbit.radius,
            this.orbit.center.y + Math.sin(this.shuttle.angle) * this.orbit.radius,
            this.shuttle.radius,
            0,
            Math.PI * 2
        );
        this.canvasCtx.fill();

        // Render sample text
        this.canvasCtx.font = this.scoreboard.fontStyle;
        this.canvasCtx.fillStyle = this.scoreboard.color;
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(
            this.stopwatch.toFixed(4),
            this.scoreboard.position.x,
            this.scoreboard.position.y
        );

    }
}

export default Game;
