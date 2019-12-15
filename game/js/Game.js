class Game {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.imagesReady = false;
        this.engine = new Engine(width, height)
        this.assetHolder = new AssetHolder()
        this.registerAssets()
        /**@type {Array<GameObject>}*/
        this.gameObjects = []
        /**@type {Array<Collidable>}*/
        this.surfaces = []
        this.batches = []
        this.singles = []
        this.frog = null
        this.factory = new ObjectFactory(this.assetHolder)
    }

    registerAssets() {
        this.assetHolder.registerImage(WATER_TILE, "./img/WATER_TILE.png")
        this.assetHolder.registerImage(GRASS_TILE, "./img/GRASS_TILE.png")
        this.assetHolder.registerImage(FROG_TILESET, "./img/FROG_TILESET.png")
        this.assetHolder.registerImage(WATER_SPLASH, "./img/SPLASH.png")
        this.assetHolder.registerImage(WOODEN_LOG, "./img/WOODEN_LOG.png")
        this.assetHolder.registerImage(LILY_PAD, "./img/LILY_PAD.png")

        this.assetHolder.registerSound(FROG_JUMP, "./sound/FROG_JUMP.ogg")
        this.assetHolder.registerSound(SPLASH, "./sound/SPLASH.flac")
    }

    checkCollision() {
        if (this.frog.isSticked) return
        this.frog.setCollision(COLLISTION_NONE)

        for (let i = 0; i < this.surfaces.length; i++) {
            this.checkCollisionRectangles(this.frog, this.surfaces[i])
        }
        for (let i = 1; i < this.gameObjects.length; i++) {
            this.checkCollisionRectangles(this.frog, this.gameObjects[i])
        }

    }

    checkStatus() {
        this.frog.checkStatus()
        for (const batch of this.batches) {
            let batchReset = true
            for (const object of batch) {
                if(object.x<this.width && object.y<this.height){
                    batchReset = false
                    break
                }
            }
            if(batchReset){
                for(const object of batch){
                    object.resetToInitialPosition()
                }
            }
        }
        for (const object of this.singles){
            if(object.x>this.width || object.y>this.height){
                object.resetToInitialPosition()
            }
        }
    }

    play() {
        this.render();
        this.checkCollision();
        this.checkStatus()
        requestAnimationFrame(this.play.bind(this));
    }

    checkCollisionRectangles(frog, object) {
        if (frog.x < object.x + object.width &&
            frog.x + frog.width > object.x &&
            frog.y < object.y + object.height &&
            frog.y + frog.height > object.y) {
            frog.setCollision(object.getCollisionType());
            object.setCollision(frog.getCollisionType());
            if (object.isSticky() && frog.direction == STOPPED) {
                frog.stickToObject(object)
            }
        }
    }

    prepare(){
        document.querySelector(".loading").remove();
        document.querySelector("#canvas").style.visibility="visible";
        this.registerObjectsAndListeners()
        this.prerenderBackground()
        this.launchObjects()
        this.play()
    }


    prerenderBackground(){
        this.engine.fillWith(this.assetHolder.getImage(WATER_TILE));
        for (let i = 0; i < this.surfaces.length; i++) {
            this.engine.drawSurface(this.surfaces[i])
        }
        this.engine.savePrerender()
    }


    imagesReadyCallback() {
        this.prepare()
    }

    run() {
        this.assetHolder.loadImages(this);
    }

    registerObjectsAndListeners() {
        console.log("Registering objects");

        let frogTileset = new Tileset(this.assetHolder.getImage(FROG_TILESET), 2, 4)
        this.frog = new Frog(1, 0);
        this.frog.setAsset(frogTileset)
        this.frog.setSound(this.assetHolder.getSound(FROG_JUMP), FROG_JUMP);
        this.frog.setSound(this.assetHolder.getSound(SPLASH), SPLASH);
        this.frog.setTileUpdate(100)
        this.frog.setDeathAsset(new Tileset(this.assetHolder.getImage(WATER_SPLASH), 2, 4))
        this.gameObjects.push(this.frog);
        this.gameObjects.push(this.factory.newWoodenLog(-TILE_SIZE, TILE_SIZE))
        this.gameObjects.push(this.factory.newWoodenLog(-2.0 * TILE_SIZE, 2.0 * TILE_SIZE))
        this.gameObjects.push(this.factory.newWoodenLog(-3.0 * TILE_SIZE, 3.0 * TILE_SIZE))
        this.gameObjects.push(this.factory.newWoodenLog(-4.0 * TILE_SIZE, 4.0 * TILE_SIZE))
        let firstBatch = []
        for (let i = 0; i < 4; i++) {
            let log = this.gameObjects[i+1]
            log.setPartOfBatch(true)
            firstBatch.push(log)
        }
        this.batches.push(firstBatch)
        //this.singles.push(this.frog)
        let self = this
        document.addEventListener('keydown', function (e) {
            e.preventDefault()
            if (e.keyCode === 37)  // left
            {
                self.frog.setDirection(LEFT);
            }
            else if (e.keyCode === 38) // up
            {
                self.frog.setDirection(UP);
            }
            else if (e.keyCode === 39) // right
            {
                self.frog.setDirection(RIGHT);
            }
            else if (e.keyCode === 40) // down
            {
                self.frog.setDirection(DOWN);
            }
            else if(e.keyCode === 73){//I - info toggle
                self.engine.boundingBoxOn = !self.engine.boundingBoxOn
                self.engine.includeCoordinates = !self.engine.includeCoordinates            
            }
        });

        let grass = new Surface(0, 0, 3*TILE_SIZE, TILE_SIZE)
        grass.setAsset(this.assetHolder.getImage(GRASS_TILE))
        this.surfaces.push(grass)
    }

    launchObjects() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].start();
        }

        this.play()
    }

    render() {
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            if (this.gameObjects[i].isDisplayed) {
                this.engine.drawObject(this.gameObjects[i]);
            }
        }
        this.engine.toggleFrameBuffer()
    }


}