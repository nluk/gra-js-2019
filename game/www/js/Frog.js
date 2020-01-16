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
        this.startingFromStick = false
        this.remainingLives = 3
        this.hasWon = false
    }

    setDirection(direction) {
        if (this.direction === STOPPED && !this.status==DEAD) {
            this.jumpSound.play()
            this.startingFromStick = this.finishedSticking
            this.direction = direction;
            this.isSticked = false
            this.stickTo = null
            this.finishedSticking = false
        }
    }

    updateState() {
        this.tileNo = (this.tileNo + 1) % 7;
        // if (this.finishedSticking && (this.direction == LEFT || this.direction == RIGHT)) {
        //     if (this.direction == LEFT) {
        //         this.x -= TILE_SIZE
        //         this.stickX -= TILE_SIZE
        //     }
        //     else {
        //         this.x += TILE_SIZE
        //         this.stickX += TILE_SIZE
        //     }
        //     this.direction = STOPPED
        //     return
        // }
        if (this.traversedDistance < TILE_SIZE && this.direction != STOPPED) {
            switch (this.direction) {
                case UP:
                    this.y -= 10;
                    break;
                case DOWN:
                    this.y += 10;
                    break;
                case LEFT:
                    if (this.startingFromStick) this.x -= this.stickDirection == START_RIGHT ? FROG_SPEED-LOG_SPEED : FROG_SPEED+LOG_SPEED
                    else this.x -= 10;
                    break;
                case RIGHT:
                    if (this.startingFromStick) this.x += this.stickDirection == START_RIGHT ? FROG_SPEED+LOG_SPEED : FROG_SPEED-LOG_SPEED
                    else this.x += 10;
                    break;
            }
            this.traversedDistance += 10;
        }
        else if (this.traversedDistance >= TILE_SIZE) {
            this.direction = STOPPED;
            this.traversedDistance = 0;
            this.collistionType = COLLISTION_NONE
        }
        if (this.finishedSticking) {
            this.setCentrePostion(this.stickTo.getCentreX() + this.stickX, this.stickTo.getCentreY() + this.stickY)
            this.isSticked = true
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
        this.stickDirection = gameObject.direction
        console.log(gameObject.direction);
        
    }

    isTiled() {
        return true;
    }


    setDeathAsset(deathAsset, collisionSource) {
        if(collisionSource == COLLISTION_NONE){
            this.drowning = deathAsset;
        }
        else{
            this.accident = deathAsset;
        }
    }


    updateTile() {
        if (!this.finishedDeathAnimation) {
            this.TILE_COLUMN++;
            if (this.TILE_COLUMN == 4 || (this.TILE_COLUMN == 6 && this.collistionType == COLLISION_ENEMY)) {
                this.TILE_COLUMN = 0;
                this.TILE_ROW = (this.TILE_ROW + 1) % 2;
            }
                if(this.collistionType == COLLISTION_NONE){
                    if (this.TILE_ROW == 1 && this.TILE_COLUMN == 3 && this.status == DEAD) {
                        this.finishedDeathAnimation = true
                    }
                }
                else if(this.collistionType == COLLISION_ENEMY){
                    if(this.TILE_COLUMN==5) this.finishedDeathAnimation = true
                }
                
                
            }
            
            
    }
    


    getAsset() {
        if (this.status == ALIVE) {
            return this.asset
        }
        else if(this.collistionType == COLLISTION_NONE){
            return this.drowning
        }
        return this.accident
    }

    setSound(howl, code) {
        if (code === FROG_JUMP) {
            this.jumpSound = howl
        }
        else if (code == SPLASH) {
            this.splashSound = howl
        }
        else{
            this.accidentSound = howl
        }
    }

    checkStatus() {
        //console.log("Frog :"+this.collistionType);
        
        if(this.collistionType == COLLISION_SURFACE && !this.isSticked && this.direction == STOPPED){
            this.x = (this.getCentreX() - this.getCentreX()%TILE_SIZE)
            this.y = (this.getCentreY() - this.getCentreY()%TILE_SIZE)
        }
        else if(this.collistionType == COLLISTION_WINNER && this.direction == STOPPED){
                this.hasWon = true
        }
        else if (this.direction == STOPPED && this.collistionType != COLLISION_SURFACE && this.status == ALIVE) {
            
            console.log("Died");
            this.status = DEAD
            if(this.collistionType==COLLISTION_NONE){
                this.TILE_COLUMN = 0
                this.TILE_ROW = 0
                this.splashSound.play()
            }
            else{
                this.accidentSound.play()
            }
            
        }
    }

    restart(){
        this.isSticked = false
        this.stickTo = null
        this.finishedDeathAnimation = false
        this.status = ALIVE
        this.hasWon = false
        this.collistionType == COLLISION_SURFACE
        this.direction == STOPPED
        this.TILE_COLUMN = 0
        this.TILE_ROW = 0
        this.resetToInitialPosition()
    }


}