class Collidable {
    constructor(x = 0, y = 0, width = TILE_SIZE, height = TILE_SIZE) {
        /**@type {number} - X position of object*/
        this.x = x;
        this.startX = x;
        this.startY = y;
        /**@type {number} - Y position of object*/
        this.y = y;
        /**@type {number} - Width of object*/
        this.width = width;
        /**@type {number} - Height of object*/
        this.height = height;
        this.collistionType = COLLISTION_NONE;
    }

    setPosition(x, y, saveAsInitial = true) {
        this.x = x;
        this.y = y;
        if(saveAsInitial){
            this.startX = x
            this.startY = y
        }
    }



    setDimensions(width, height) {
        this.width = width;
        this.height = height;
    }

    setAsset(asset) {
        this.asset = asset;
    }

    getAsset() {
        return this.asset;
    }

    setCollision(collistionType) {
        this.collistionType = collistionType;
    }

    getCollisionType() {
        return COLLISTION_NONE;
    }

    isSticky() {
        return false;
    }

    getCentreX() {
        return this.x + (this.width / 2.0)
    }

    getCentreY() {
        return this.y + (this.height / 2.0)
    }

    setCentrePostion(centreX, centreY) {
        this.x = centreX - (this.width / 2.0)
        this.y = centreY - (this.height / 2.0)
    }

}