class ObjectFactory {

    constructor(assetHolder) {
        this.assetHolder = assetHolder
    }

    newLog(entityData, x, y) {
        let log = new GameObject(1, 0)
        log.updateState = function () {
            log.x = log.x + log.getXIncrement()
        }
        log.setAsset(this.assetHolder.getImage(WOODEN_LOG))
        log.collistionType = COLLISION_SURFACE;
        log.getCollisionType = function () {
            return COLLISION_SURFACE
        }
        log.getXIncrement = function () {
            return log.direction == START_LEFT ? -LOG_SPEED : LOG_SPEED
        }
        log.setDimensions(2.0 * TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return true
        }
        log.setPosition(x + (entityData.offset) * TILE_SIZE, y)
        log.setDirection(entityData.direction)
        return log
    }

    newCroc(entityData, x, y) {
        let log = new GameObject(1, 0)
        log.updateState = function () {
            log.x = log.x + (log.direction==START_LEFT ? -3 : 3)
        }
        log.setAsset(this.assetHolder.getImage(CROC))
        log.collistionType = COLLISION_ENEMY;
        log.getCollisionType = function () {
            return COLLISION_ENEMY
        }
        log.setDimensions(3.0 * TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return false
        }
        log.setPosition(x + (entityData.offset) * TILE_SIZE, y)
        log.setDirection(entityData.direction)
        return log
    }

    newFrog(x, y) {
        let frogTileset = new Tileset(this.assetHolder.getImage(FROG_TILESET), 2, 4)
        let frog = new Frog(1, 0);
        frog.setAsset(frogTileset)
        frog.setPosition(x , y, true)
        frog.setSound(this.assetHolder.getSound(FROG_JUMP), FROG_JUMP);
        frog.setSound(this.assetHolder.getSound(SPLASH), SPLASH);
        frog.setSound(this.assetHolder.getSound(CAR_HIT), CAR_HIT);
        frog.setTileUpdate(100)
        frog.setDeathAsset(new Tileset(this.assetHolder.getImage(WATER_SPLASH), 2, 4), COLLISTION_NONE)
        frog.setDeathAsset(new Tileset(this.assetHolder.getImage(BLOOD_TILESET),1,6), COLLISION_ENEMY)
        return frog
    }

    newCar(entityData, x, y){
        let log = new GameObject(1, 0)
        log.updateState = function () {
            log.x = log.x + (log.direction==START_LEFT ? -CAR_SPEED : CAR_SPEED)
        }
        log.setAsset(this.assetHolder.getImage(CAR))
        log.collistionType = COLLISION_ENEMY;
        log.getCollisionType = function () {
            return COLLISION_ENEMY
        }
        log.setDimensions(2.0 * TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return true
        }
        log.setPosition(x + (entityData.offset) * TILE_SIZE, y)
        log.setDirection(entityData.direction)
        return log
    }

    newExit(entityData, x, y) {
        let log = new GameObject(1, 0)
        log.updateState = function () {
            
        }
        log.setAsset(this.assetHolder.getImage(EXIT))
        log.collistionType = COLLISTION_WINNER;
        log.getCollisionType = function () {
            return COLLISTION_WINNER
        }
        log.setDimensions(TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return false
        }
        log.setPosition(x + (entityData.offset) * TILE_SIZE, y)
        return log
    }


    newObject(entityData, x, y){
        switch (entityData.type) {
            case "log":
                return this.newLog(entityData, x, y)
            case "croc":
                return this.newCroc(entityData, x, y)
            case "frog":
                return this.newFrog(x, y)
            case "car":
                return this.newCar(entityData, x, y)
            case "exit":
                return this.newExit(entityData, x, y)
            default:
                console.log("Unknown entity type in object factory: "+entityData.type)
        }
    }


}