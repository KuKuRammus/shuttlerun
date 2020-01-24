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
    doublePi = Math.PI * 2;

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

    // Internal stopwatch
    stopwatch = 0;

    // Obstacle
    obstacle = {
        color: {
            border: '#272727',
            fill: '#eff1f3'
        },
        radius: 12,
        angle: 0.0
    };

    normalizeRadianAngle(angle) {
        if (angle > this.doublePi) {
            return angle % this.doublePi;
        } else if (angle < -this.doublePi) {
            return -(angle % this.doublePi);
        }
        return angle;
    }

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
        this.orbit.thickness = Math.ceil(this.orbit.radius * 0.0157);

        // Calculate shuttle size (+ angular size) and set initial position
        this.shuttle.angle = 90.0 * this.degreeToRadian;
        this.shuttle.radius = Math.round((width * 0.063) / 2);
        this.shuttle.angularSize = (this.shuttle.radius * 2 * 47) / this.orbit.radius * this.degreeToRadian;

        // Calculate scoreboard position
        this.scoreboard.position.x = this.orbit.center.x;
        this.scoreboard.position.y = this.orbit.center.y + Math.round(this.orbit.radius * 0.16 / 3);
        this.scoreboard.fontStyle = `${Math.round(this.orbit.radius * 0.16)}px Overpass Mono`;
        this.scoreboard.text = 'no collision';

        // Calculate obstacle properties
        this.obstacle.radius = this.orbit.radius * 0.142;

        // Regenerate obstacle
        this.regenerateObstacle();

        // Register handle for keyboard events
        window.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    }

    regenerateObstacle() {
        const { obstacle, shuttle, doublePi } = this;
        this.obstacle.angle = this.normalizeRadianAngle(
            shuttle.angle + (Math.random() * doublePi)
        );
    }

    handleKeydownEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) {
            switch (event.code) {
                case 'ArrowLeft': {
                    // TODO
                } break;

                case 'ArrowRight': {
                    // TODO
                } break;

                case 'KeyO': {
                    // Regenerate obstacle
                    this.regenerateObstacle();
                } break;
            }
        }
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

    update(deltaTime) {
        this.shuttle.angle += this.normalizeRadianAngle(
            this.shuttle.speed * deltaTime * this.shuttle.direction * this.degreeToRadian
        );
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
        this.canvasCtx.fillStyle = this.obstacle.color.fill;
        this.canvasCtx.strokeStyle = this.obstacle.color.border;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(
            this.orbit.center.x + Math.cos(this.obstacle.angle) * this.orbit.radius,
            this.orbit.center.y + Math.sin(this.obstacle.angle) * this.orbit.radius,
            this.obstacle.radius,
            0,
            this.doublePi
        );
        this.canvasCtx.fill();
        this.canvasCtx.stroke();

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
