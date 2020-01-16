/**
 * @class GameObject
 */
class GameObject extends Collidable {

    /**
     * GameObject constructor
     * 
     * @param {number} updateStateMillis - Time between updateState() calls
     * @param {number} delay - Delay before first updateState() call
     * @param {HTMLImageElement} imageAsset - Graphic asset of object
     * @memberof GameObject
     */
    constructor(updateStateMillis, delay = 0) {
        super()
        /**@type {number} - Interval of running updateState() - NULL if not running*/
        this.interval = null;
        /**@type {boolean} - Visibility of game object()*/
        this.isDisplayed = false;
        /**@type {number} - Time between updateState() calls*/
        this.updateStateMillis = updateStateMillis;
        /**@type {number} - Delay before first updateState() call*/
        this.delay = delay;
        this.isPartOfBatch = false
        this.shouldRestart = false
    }

    start() {
        if ((this.updateStateMillis !== null) && (this.interval === null)) {
            setTimeout(startUpdateStateInterval.bind(this), this.delay);
        }
        else if (this.updateStateMilliseconds === null) {
            this.gameObjectIsDisplayed = true; // by default, gameObjects that have no updateState() interval should be visible
        }

        function startUpdateStateInterval() // this function is only ever called from inside the start() method 
        {
            this.interval = setInterval(this.updateState.bind(this), this.updateStateMillis);
            if (this.isTiled()) {
                this.animInterval = setInterval(this.updateTile.bind(this), this.tileUpdateMillis);
            }
            this.isDisplayed = true;
        }
    }
    

    updateTile() {

    }

    setTileUpdate(tileUpdateMillis) {
        this.tileUpdateMillis = tileUpdateMillis;
    }

    stop() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null; /* set to null when not running */
        }
        this.isDisplayed = true;
    }

    stopAndHide() {
        this.stop();
        this.isDisplayed = false;
    }

    isTiled() {
        return false;
    }

    updateState() { }

    setSound(howl, code) { }

    setPartOfBatch(isPartOfBatch){
        this.isPartOfBatch = isPartOfBatch
    }

    resetToInitialPosition(){
        //console.log("Reset position called");
        
        this.x = this.startX
        this.y = this.startY
        this.shouldRestart = false
    }

    setDirection(direction){
        this.direction = direction;
    }

    getXIncrement(){
        
    }
    




}