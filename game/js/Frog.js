class Frog extends GameObject {

    constructor(updateStateMillis, delay = 0, imageAsset) {
        super(updateStateMillis, delay, imageAsset)
        this.direction = STOPPED;
        this.traversedDistance = 0;
        this.tiles = 1
        this.collistionType = COLLISION_SURFACE
        this.TILE_COLUMN = 0;
        this.TILE_ROW = 0;
        this.status = ALIVE
        this.finishedDeathAnimation = false
        this.isSticked = false
    }

    setDirection(direction) {
        if (this.direction === STOPPED) {
            this.jumpSound.play()
            this.direction = direction;
            this.isSticked = false
            this.stickTo = null
            this.finishedSticking = false
        }
    }

    updateState() {
        this.tileNo = (this.tileNo + 1) % 7;
        if (this.traversedDistance < TILE_SIZE && this.direction != STOPPED) {
            switch (this.direction) {
                case UP:
                    this.y--;
                    break;
                case DOWN:
                    this.y++;
                    break;
                case LEFT:
                    this.x--;
                    break;
                case RIGHT:
                    this.x++;
                    break;
            }
            this.traversedDistance++;
        }
        else if (this.traversedDistance == TILE_SIZE) {
            this.direction = STOPPED;
            this.traversedDistance = 0;
            this.collistionType = COLLISTION_NONE
        }
        if (this.finishedSticking) {
            this.setCentrePostion(this.stickTo.getCentreX() + this.stickX, this.stickTo.getCentreY() + this.stickY)
        }
        else if (this.isSticked && this.direction == STOPPED) {
            this.stickY = this.stickTo.getCentreY() - this.getCentreY()
            console.log(this.stickX);
            console.log(this.stickY);
            this.finishedSticking = true
        }
    }

    stickToObject(gameObject) {
        this.stickTo = gameObject
        this.isSticked = true
        this.finishedSticking = false
        this.stickX = this.getCentreX() - this.stickTo.getCentreX()
    }

    isTiled() {
        return true;
    }


    setDeathAsset(deathAsset) {
        this.deathAsset = deathAsset;
    }

    updateTile() {
        if (!this.finishedDeathAnimation) {
            this.TILE_COLUMN++;
            if (this.TILE_COLUMN == 4) {
                this.TILE_COLUMN = 0;
                this.TILE_ROW = (this.TILE_ROW + 1) % 2;
            }
            if (this.TILE_ROW == 1 && this.TILE_COLUMN == 3 && this.status == DEAD) {
                this.finishedDeathAnimation = true
            }
        }
    }


    getAsset() {
        if (this.status == ALIVE) {
            return this.asset
        }
        return this.deathAsset;
    }

    setSound(howl, code) {
        if(code === FROG_JUMP){
            this.jumpSound = howl
        }
        else if(code == SPLASH){
            this.splashSound = howl
        }
    }

    checkStatus() {
        if (this.direction == STOPPED && this.collistionType != COLLISION_SURFACE && this.status == ALIVE) {
            this.splashSound.play()
            console.log("Died");
            this.status = DEAD
            this.TILE_COLUMN = 0
            this.TILE_ROW = 0
        }
    }


}