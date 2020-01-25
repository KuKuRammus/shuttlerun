class Game
{

    // Game state
    STATE_INIT = 1;
    STATE_RUNNING = 2;
    STATE_GAME_OVER = 3;
    state = this.STATE_INIT;

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
        initialSpeed: 50 * this.degreeToRadian,
        speed: 0,
        speedIncrease: 1.5 * this.degreeToRadian,
        color: '#009fb7',
        approachTriggerAngularRadius: 0.0,
        approachCircleRadius: 0.0,
        approachCircleOpacity: 0.5,
        approachCircleColor: '#009fb7',
    };

    // Scoreboard
    scoreboard = {
        position: {
            x: 0.0,
            y: 0.0
        },
        fontStylePrimary: '',
        fontStyleSecondary: '',
        color: '#272727',
        score: 0,
        timeRemaining: 0.0,
        timeIncrement: 1.5,
        text: {
            top: '',
            middle: '0',
            bottom: '00:00:0000',
        },
        textOffsetY: {
            top: 10.0,
            middle: 0.0,
            bottom: 20.0
        }
    };

    // Obstacle
    obstacle = {
        color: {
            border: '#272727',
            fill: '#eff1f3'
        },
        radius: 12,
        angle: 0.0,
        angularRadius: 0.0,
        minimalOffsetFromShuttle: Math.PI / 2.5
    };

    // Collision
    collision = {
        collides: false
    };

    // Interface text
    text = {
        scoreboard: {
            init: 'Click/Spacebar to start',
            running: 'Score',
            gameOver: 'Game over'
        }
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
        this.shuttle.approachTriggerAngularRadius = Math.atan((this.shuttle.radius * 2) / this.shuttle.radius) / 2;
        this.setShuttleSpeed(30);

        // Calculate scoreboard position
        this.scoreboard.position.x = this.orbit.center.x;
        this.scoreboard.position.y = this.orbit.center.y + Math.round(this.orbit.radius * 0.16 / 3);
        this.scoreboard.fontStylePrimary = `${Math.round(this.orbit.radius * 0.16)}px Overpass Mono`;
        this.scoreboard.fontStyleSecondary = `${Math.round(this.orbit.radius * 0.1)}px Overpass Mono`;
        this.scoreboard.textOffsetY.top = -(Math.round(this.orbit.radius * 0.1) * 2);
        this.scoreboard.textOffsetY.bottom = Math.round(this.orbit.radius * 0.1) * 1.5;

        // Calculate obstacle properties
        this.obstacle.radius = this.orbit.radius * 0.142;
        this.obstacle.angularRadius = Math.atan((this.obstacle.radius * 2) / this.orbit.radius) * 0.6;

        this.transitionToInitState();

        // Register handle for keyboard events
        window.addEventListener('keydown', this.handleKeydownEvent.bind(this));

        // Register handle for keyboard events
        window.addEventListener('mousedown', this.handleMouseClick.bind(this));
    }

    setShuttleSpeed(degree) {
        this.shuttle.speed = degree * this.degreeToRadian;
    }

    regenerateObstacle() {
        const randomOffsetFromShuttle = this.obstacle.minimalOffsetFromShuttle + (Math.random() * Math.PI / 2);
        this.obstacle.angle = this.normalizeRadianAngle(
            this.shuttle.angle + randomOffsetFromShuttle * this.shuttle.direction
        );
    }

    handleInputHit() {
        switch (this.state) {

            case this.STATE_INIT: {
                this.transitionToRunningState();
            } break;

            case this.STATE_RUNNING: {
                // Collision check
                if (this.collision.collides) {
                    this.shuttle.direction *= -1;
                    this.regenerateObstacle();
                    this.setScore(this.scoreboard.score + parseInt(this.shuttle.speed * 100));
                    this.setTimeRemaining(this.scoreboard.timeRemaining + this.scoreboard.timeIncrement);

                    // Increase speed
                    this.shuttle.speed += this.shuttle.speedIncrease;
                }
            } break;

            case this.STATE_GAME_OVER: {
                this.transitionToInitState();
            } break;

        }
    }

    handleMouseClick(event) {
        event.preventDefault();
        event.stopPropagation();

        this.handleInputHit();
    }

    setScore(score) {
        this.scoreboard.score = score;
        this.scoreboard.text.middle = score.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    setTimeRemaining(time) {

        this.scoreboard.timeRemaining = time;

        if (time <= 0) {
            this.scoreboard.text.bottom = '00:00,000';
            return;
        }

        const pad = function(num, size) { return ('000' + num).slice(size * -1); },
            tempTime = parseFloat(time).toFixed(3),
            minutes = Math.floor(tempTime / 60) % 60,
            seconds = Math.floor(tempTime - minutes * 60),
            milliseconds = tempTime.slice(-3);
        this.scoreboard.text.bottom = pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
    }

    transitionToInitState() {
        this.state = this.STATE_INIT;
        this.scoreboard.text.top = this.text.scoreboard.init;
        this.shuttle.angle = Math.PI / 2;
        this.setTimeRemaining(15.0);
        this.setScore(0)
    }

    transitionToRunningState() {
        this.state = this.STATE_RUNNING;
        this.shuttle.speed = this.shuttle.initialSpeed;
        this.regenerateObstacle();
        this.scoreboard.text.top = this.text.scoreboard.running;
    }

    transitionToGameOverState() {
        this.state = this.STATE_GAME_OVER;
        this.scoreboard.text.top = this.text.scoreboard.gameOver;
        this.shuttle.speed = 0.0;
    }

    handleKeydownEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) {
            switch (event.code) {
                case 'ArrowUp': {
                    this.shuttle.speed += 5 * this.degreeToRadian;
                } break;

                case 'ArrowDown': {
                    this.shuttle.speed -= 5 * this.degreeToRadian;
                } break;

                case 'Space': {
                    // Temp collision check
                    this.handleInputHit()
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
        switch (this.state) {
            case this.STATE_INIT: {} break;

            case this.STATE_RUNNING: {
                const angleFrameChange = this.shuttle.speed * deltaTime * this.shuttle.direction;
                this.shuttle.angle = this.normalizeRadianAngle(this.shuttle.angle + angleFrameChange);

                const distanceToObstacle = Math.abs(Math.atan2(
                    Math.sin(this.shuttle.angle - this.obstacle.angle),
                    Math.cos(this.shuttle.angle - this.obstacle.angle)
                ));
                this.collision.collides = (distanceToObstacle < this.obstacle.angularRadius);
                this.shuttle.approachCircleRadius = distanceToObstacle * (this.shuttle.radius * 10);

                if (distanceToObstacle > this.shuttle.approachTriggerAngularRadius) {
                    this.shuttle.approachCircleOpacity = 0.0;
                } else {
                    this.shuttle.approachCircleOpacity = 1.0 - (1.0 / this.shuttle.approachTriggerAngularRadius * distanceToObstacle);
                }

                const timeRemaining = this.scoreboard.timeRemaining - deltaTime;
                this.setTimeRemaining(timeRemaining);
                if (timeRemaining < 0) {
                    this.transitionToGameOverState();
                }
            } break;

            case this.STATE_GAME_OVER: {} break;
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

        if (this.state !== this.STATE_INIT) {
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
        }


        if (this.state === this.STATE_RUNNING) {
            // Render approach circle
            this.canvasCtx.save();
            this.canvasCtx.globalAlpha = this.shuttle.approachCircleOpacity;
            this.canvasCtx.strokeStyle = this.shuttle.approachCircleColor;
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                this.orbit.center.x + Math.cos(this.shuttle.angle) * this.orbit.radius,
                this.orbit.center.y + Math.sin(this.shuttle.angle) * this.orbit.radius,
                this.shuttle.approachCircleRadius,
                0,
                this.doublePi
            );
            this.canvasCtx.stroke();
            this.canvasCtx.restore();
        }

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

        // Render scoreboard text
        this.canvasCtx.font = this.scoreboard.fontStyleSecondary;
        this.canvasCtx.fillStyle = this.scoreboard.color;
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(
            this.scoreboard.text.top,
            this.scoreboard.position.x,
            this.scoreboard.position.y + this.scoreboard.textOffsetY.top
        );

        this.canvasCtx.font = this.scoreboard.fontStylePrimary;
        this.canvasCtx.fillStyle = this.scoreboard.color;
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(
            this.scoreboard.text.middle,
            this.scoreboard.position.x,
            this.scoreboard.position.y + this.scoreboard.textOffsetY.middle
        );

        this.canvasCtx.font = this.scoreboard.fontStyleSecondary;
        this.canvasCtx.fillStyle = this.scoreboard.color;
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(
            this.scoreboard.text.bottom,
            this.scoreboard.position.x,
            this.scoreboard.position.y + this.scoreboard.textOffsetY.bottom
        );

    }
}

export default Game;
