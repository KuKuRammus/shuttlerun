class Game
{
    // Canvas drawing 2D context
    canvasCtx = null;

    currentTime = 0;
    lastTime = 0;

    constructor() {}

    init(width, height, rootElement) {
        // Create play field
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        rootElement.appendChild(canvas);

        // Save reference to drawing context
        this.canvasCtx = canvas.getContext('2d')
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
        // TODO
    }

    render(deltaTime) {
        // TODO
    }
}

export default Game;
