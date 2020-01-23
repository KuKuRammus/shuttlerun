import { Howl, Howler } from 'howler'

// Resources / Sound / Hit
import soundHitLeft from './media/sounds/hit/left.mp3'
import soundHitRight from './media/sounds/hit/right.mp3'

class Game
{
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
        speed: 20,
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

    // Collisions
    collision = {
        distance: 0.0,
        isCollides: false
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
        this.shuttle.radius = Math.round((width * 0.063) / 2);
        this.shuttle.angularSize = (this.shuttle.radius * 2 * 47) / this.orbit.radius * this.degreeToRadian;

        // Calculate obstacle size
        this.obstacle.dimensions.x = this.orbit.radius * 0.22;
        this.obstacle.dimensions.y = this.orbit.radius * 0.03;

        // Calculate scoreboard position
        this.scoreboard.position.x = this.orbit.center.x;
        this.scoreboard.position.y = this.orbit.center.y + Math.round(this.orbit.radius * 0.16 / 3);
        this.scoreboard.fontStyle = `${Math.round(this.orbit.radius * 0.16)}px Overpass Mono`;
        this.scoreboard.text = 'no collision';

        // Set collision detection properties
        this.collision.distance = this.shuttle.angularSize;

        // Create obstaclecollisionAngleIncrease
        this.generateObstacle();

        // Load sounds
        this.sound.hit.left = new Howl({ src: [soundHitLeft], volume: this.sound.settings.volume });
        this.sound.hit.right = new Howl({ src: [soundHitRight], volume: this.sound.settings.volume });

        // Register handle for keyboard events
        window.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
    }

    handleKeyboardEvent(event) {
        switch (event.code) {
            case 'Space': {
                if (this.collision.isCollides) {
                    this.scoreboard.score += 1;
                    this.shuttle.speed += 10;
                    this.shuttle.direction *= -1;
                    this.sound.hit.left.play();
                    this.generateObstacle()
                }
            } break;

            case 'KeyR': {
                this.shuttle.angle = 0;
            } break;

            case 'KeyS': {
                this.shuttle.direction = 0;
            } break;

            case 'KeyL': {
                this.shuttle.direction = 1;
            } break;

            case 'KeyO': {
                this.generateObstacle()
            } break;
        }
    }

    tick() {
        window.requestAnimationFrame(this.tick.bind(this));

        this.currentTime = (new Date()).getTime();
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
        const previousFrameShuttleAngle = this.shuttle.angle;
        this.shuttle.angle += ((this.shuttle.speed * deltaTime) * this.shuttle.direction) * this.degreeToRadian;
        const collisionAngleIncrease = Math.abs(previousFrameShuttleAngle - this.shuttle.angle);
        if (this.shuttle.angle > (Math.PI * 2)) {
            this.shuttle.angle = this.shuttle.angle % (Math.PI * 2);
        } else if (this.shuttle.angle < -(Math.PI * 2)) {
            this.shuttle.angle = -(this.shuttle.angle % (Math.PI * 2));
        }

        // Collision detection
        this.collision.isCollides = Math.abs(this.shuttle.angle - this.obstacle.angle) < this.collision.distance + collisionAngleIncrease;
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

        // Render obstacle
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = this.obstacle.color;
        this.canvasCtx.beginPath();
        this.canvasCtx.translate(
            this.orbit.center.x + Math.cos(this.obstacle.angle) * this.orbit.radius,
            this.orbit.center.y + Math.sin(this.obstacle.angle) * this.orbit.radius
        );
        this.canvasCtx.rotate(this.obstacle.angle);
        this.canvasCtx.rect(
            0 - this.obstacle.dimensions.x / 2,
            0 - this.obstacle.dimensions.y / 2,
            this.obstacle.dimensions.x,
            this.obstacle.dimensions.y
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
            this.scoreboard.score,
            this.scoreboard.position.x,
            this.scoreboard.position.y
        );

    }
}

export default Game;
