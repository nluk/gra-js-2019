/**
 * @class Engine
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {HTMLCanvasElement} canvas - Main canvas
 * @property {OffscreenCanvas} offCanvas - Offscreen canvas
 * @property {CanvasRenderingContext2D} offCtx - Offscreen canvas rendering context
 */
class Engine {
    /**
     *Creates an instance of Engine.
     * @param {number} width
     * @param {number} height
     * @memberof Engine
     */
    constructor(width, height) {
        /**@type {number}*/
        this.width = width
        /**@type {number}*/
        this.height = height
        /**@type {HTMLCanvasElement}*/
        this.canvas = document.getElementById("canvas");
        /**@type {CanvasRenderingContext2D}*/
        this.ctx = this.canvas.getContext('2d')
        /**@type {OffscreenCanvas}*/
        this.offCanvas = new OffscreenCanvas(width, height)
        /**@type {OffscreenRenderingContext}*/
        this.offCtx = this.offCanvas.getContext("2d")
        this.boundingBoxOn = false
        this.staticBackgroundCanvas = new OffscreenCanvas(width, height)
        this.includeCoordinates = false
    }

    /**
     *Draws given asset to OffscreenCanvas.
     * @param {GameObject} gameObject - Object to draw
     */
    drawObject(gameObject) {

        if (!gameObject.isTiled()) {
            this.offCtx.drawImage(gameObject.getAsset(), gameObject.x, gameObject.y, gameObject.width, gameObject.height);
        }
        else {
            this.drawTiledObject(gameObject)
        }
        if (this.boundingBoxOn) {
            this.offCtx.strokeStyle = "#ff0000"
            this.offCtx.strokeRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height)
        }
        if(this.includeCoordinates){
            this.offCtx.fillStyle = "#ffffff"
            this.offCtx.font = "15px Arial";
            this.offCtx.fillText("[ "+gameObject.x+" , "+gameObject.y+" ]", gameObject.x-50, gameObject.y);
        }

    }

    setBoundingBoxOn(boundingBoxOn) {
        this.boundingBoxOn = boundingBoxOn
    }

    drawTiledObject(gameObject) {
        let tileset = gameObject.getAsset()
        this.offCtx.drawImage(tileset.asset, gameObject.TILE_COLUMN * tileset.TILE_WIDTH, gameObject.TILE_ROW * tileset.TILE_HEIGHT, tileset.TILE_WIDTH, tileset.TILE_HEIGHT, gameObject.x, gameObject.y, gameObject.width, gameObject.height)
    }

    fillWith(image) {
        this.offCtx.fillStyle = this.offCtx.createPattern(image, "repeat")
        this.offCtx.fillRect(0, 0, this.width, this.height)
    }

    toggleFrameBuffer() {
        this.ctx.drawImage(this.offCanvas, 0,0)
        this.offCtx.drawImage(this.staticBackgroundCanvas,0,0)
    }

    drawSurface(surface) {
        this.offCtx.fillStyle = this.offCtx.createPattern(surface.getAsset(), "repeat")
        this.offCtx.fillRect(surface.x, surface.y, surface.width, surface.height)
    }

    savePrerender(){
        let backgroundCtx = this.staticBackgroundCanvas.getContext("2d")
        backgroundCtx.drawImage(this.offCanvas,0,0)
    }

}
