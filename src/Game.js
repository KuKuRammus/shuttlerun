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
    orbitCenter = {
        x: 0.0,
        y: 0.0
    };
    orbitRadius = 0.0;
    orbitBorderWidth = 3;
    orbitColor = '#272727';

    // Shuttle properties
    shuttleDirection = -1;
    shuttleRadius = 90.0;
    shuttleColor = '#009fb7';
    shuttleAngle = 0;
    shuttleSpeed = 25;

    // Obstacle
    obstacleMinimalOffsetFromShuttle = Math.PI / 2.5;
    obstacleColor = '#e31919';
    obstacle = {
        angle: 0.0
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
        this.orbitCenter.x = Math.round(width / 2);
        this.orbitCenter.y = Math.round(height * 0.3);
        this.orbitRadius = Math.round((width * 0.7) / 2);

        // Calculate shuttle size and set initial position
        this.shuttleRadius = Math.round((width * 0.063) / 2);

        // Create
        this.obstacle.angle = Math.random() * Math.PI * 2;

        // Register handle for keyboard events
        window.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
    }

    handleKeyboardEvent(event) {
        switch (event.code) {
            case 'Space': {
                this.shuttleDirection *= -1;
            } break;

            case 'KeyR': {
                this.shuttleAngle = 90 * this.degreeToRadian;
            } break;

            case 'KeyS': {
                this.shuttleDirection = 0;
            } break;

            case 'KeyL': {
                this.shuttleDirection = 1;
            } break;

            case 'KeyO': {
                const randomOffset = this.obstacleMinimalOffsetFromShuttle + (Math.random() * Math.PI / 2);
                this.obstacle.angle = ((this.shuttleAngle + (randomOffset * this.shuttleDirection)) % (Math.PI * 2));
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

    update(deltaTime) {
        this.shuttleAngle += ((this.shuttleSpeed * deltaTime) * this.shuttleDirection) * this.degreeToRadian;
    }

    render(deltaTime) {
        // Clear
        this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Render orbit
        this.canvasCtx.lineWidth = this.orbitBorderWidth;
        this.canvasCtx.strokeStyle = this.orbitColor;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(
            this.orbitCenter.x,
            this.orbitCenter.y,
            this.orbitRadius,
            0,
            Math.PI * 2
        );
        this.canvasCtx.stroke();

        // Render shuttle
        this.canvasCtx.fillStyle = this.shuttleColor;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(
            this.orbitCenter.x + Math.cos(this.shuttleAngle) * this.orbitRadius,
            this.orbitCenter.y + Math.sin(this.shuttleAngle) * this.orbitRadius,
            this.shuttleRadius,
            0,
            Math.PI * 2
        );
        this.canvasCtx.fill();

        // Render obstacle
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = this.obstacleColor;
        this.canvasCtx.beginPath();
        this.canvasCtx.translate(
            this.orbitCenter.x + Math.cos(this.obstacle.angle) * this.orbitRadius,
            this.orbitCenter.y + Math.sin(this.obstacle.angle) * this.orbitRadius
        );
        this.canvasCtx.rotate(this.obstacle.angle);
        this.canvasCtx.rect(0 - 18, 0 - 6, 36, 6);
        this.canvasCtx.fill();
        this.canvasCtx.restore();

    }
}

export default Game;
