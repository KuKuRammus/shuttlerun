class Game
{

    // Canvas drawing 2D context
    canvasCtx = null;

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
}

export default Game;
