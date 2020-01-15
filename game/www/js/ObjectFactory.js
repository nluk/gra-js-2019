class ObjectFactory {

    constructor(assetHolder) {
        this.assetHolder = assetHolder
    }

    newWoodenLog(x, y) {
        let log = new GameObject(1, 0)
        log.updateState = function () {
            log.x += 3;
        }
        log.setAsset(this.assetHolder.getImage(WOODEN_LOG))
        log.collistionType = COLLISION_SURFACE;
        log.getCollisionType = function () {
            return COLLISION_SURFACE
        }
        log.setDimensions(2.0 * TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return true
        }
        log.setPosition(x, y)
        return log
    }

    newLily(x, y) {
        let log = new GameObject(20, 0)
        log.ticks = 0
        log.updateState = function () {
            log.ticks++;
            if (log.ticks == 100) {
                log.ticks = 0
                log.isDisplayed = !log.isDisplayed
                log.collistionType = this.collistionType == COLLISION_SURFACE ? COLLISTION_NONE : COLLISION_SURFACE
            }
        }
        log.setAsset(this.assetHolder.getImage(LILY_PAD))
        log.collistionType = COLLISION_SURFACE;
        log.getCollisionType = function () {
            return COLLISION_SURFACE
        }
        log.setDimensions(TILE_SIZE, TILE_SIZE)
        log.isSticky = function () {
            return true
        }
        log.setPosition(x, y)
        return log
    }


}