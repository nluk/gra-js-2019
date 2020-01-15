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
        this.tileCollisions = []
        this.frog = null
        this.factory = new ObjectFactory(this.assetHolder)
        this.touchStarted = false
        this.touchStartX = 0
        this.touchStartY = 0
    }

    registerAssets() {
        for (let i = 1; i <= 15; i++) {
            let tileName = "" + i
            let tilePath = "./img/tiles/" + tileName + ".png"
            this.assetHolder.registerImage(tileName, tilePath)
        }
        for (let i = 1; i <= 14; i++) {
            let tileName = "" + i + "i"
            let tilePath = "./img/items/" + tileName + ".png"
            this.assetHolder.registerImage(tileName, tilePath)
        }
        this.assetHolder.registerImage(FROG_TILESET, "./img/FROG_TILESET.png")
        this.assetHolder.registerImage(WATER_SPLASH, "./img/SPLASH.png")
        this.assetHolder.registerImage(WOODEN_LOG, "./img/WOODEN_LOG.png")
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
        for (let i = 0; i < this.tileCollisions.length; i++) {
            this.checkCollisionTiles(this.frog, this.tileCollisions[i])
        }

    }

    checkStatus() {
        this.frog.checkStatus()
        for (const batch of this.batches) {
            let batchReset = true
            for (const object of batch) {
                if (object.x < this.width && object.y < this.height) {
                    batchReset = false
                    break
                }
            }
            if (batchReset) {
                for (const object of batch) {
                    object.resetToInitialPosition()
                }
            }
        }
        for (const object of this.singles) {
            if (object.x > this.width || object.y > this.height) {
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
                console.log("Sticking frog to" + object);
                frog.stickToObject(object)
            }
        }
    }

    checkCollisionTiles(frog, object) {
        // console.log("Obj: [" + object.x + "," + (object.x + object.width) + "]");
        // console.log("Frog: [" + frog.x + "," + (frog.x + frog.width) + "]");

        //this.engine.drawBox(object.x, object.y, object.width, object.height)
        //this.engine.drawBox(frog.x, frog.y, TILE_SIZE, TILE_SIZE)

        if (frog.x < object.x + object.width &&
            frog.x + frog.width > object.x &&
            frog.y < object.y + object.height &&
            frog.y + frog.height > object.y) {
            frog.setCollision(COLLISION_SURFACE);
        }
    }

    prepare() {
        document.querySelector(".loading").remove();
        document.querySelector("#canvas").style.visibility = "visible";
        this.registerObjectsAndListeners()
        this.loadLevel()
        //this.prerenderBackground()
        this.launchObjects()
        this.play()
    }

    loadLevel() {
        let lvlString = '{"levelData":[[{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":"7","i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}],[{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null},{"b":null,"t":null,"i":null,"r":0,"e":null}]],"collistionData":[[{"s":2,"l":3}],[{"s":2,"l":3}],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]}'
        let lvl = JSON.parse(lvlString)
        let tilesData = lvl.levelData
        for (let i = 0; i < tilesData.length; i++) {
            for (let j = 0; j < tilesData[i].length; j++) {
                let data = tilesData[i][j];
                if (data.b != null) {
                    this.engine.drawTile(this.assetHolder.getImage(data.b), i * TILE_SIZE, j * TILE_SIZE, 0)
                }
                if (data.t != null) {
                    this.engine.drawTile(this.assetHolder.getImage(data.t), i * TILE_SIZE, j * TILE_SIZE, data.r)
                }
                if (data.i != null) {
                    this.engine.drawTile(this.assetHolder.getImage(data.i), i * TILE_SIZE, j * TILE_SIZE, 0)
                }
                if (data.e != null) {
                    this.gameObjects.push(this.factory.newObject(data.e))
                }

            }

        }
        let collisionData = lvl.collisionData
        let rowNo = 0
        for (const rowCollisions of collisionData) {
            for (const collision of rowCollisions) {
                console.log(collision);
                console.log("Starting at: " + collision.s + " | length: " + collision.l);

                this.tileCollisions.push({ x: collision.s * TILE_SIZE, y: rowNo * TILE_SIZE, height: TILE_SIZE, width: collision.l * TILE_SIZE })
            }
            rowNo++
        }
        this.engine.savePrerender()
    }


    prerenderBackground() {
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
        this.frog.setPosition(4 * TILE_SIZE, 0, false)
        this.frog.setSound(this.assetHolder.getSound(FROG_JUMP), FROG_JUMP);
        this.frog.setSound(this.assetHolder.getSound(SPLASH), SPLASH);
        this.frog.setTileUpdate(100)
        this.frog.setDeathAsset(new Tileset(this.assetHolder.getImage(WATER_SPLASH), 2, 4))
        this.gameObjects.push(this.frog);
        // this.gameObjects.push(this.factory.newWoodenLog(-TILE_SIZE, TILE_SIZE))
        // this.gameObjects.push(this.factory.newWoodenLog(-2.0 * TILE_SIZE, 2.0 * TILE_SIZE))
        // this.gameObjects.push(this.factory.newWoodenLog(-3.0 * TILE_SIZE, 3.0 * TILE_SIZE))
        // this.gameObjects.push(this.factory.newWoodenLog(-4.0 * TILE_SIZE, 4.0 * TILE_SIZE))
        // let firstBatch = []
        // for (let i = 0; i < 4; i++) {
        //     let log = this.gameObjects[i + 1]
        //     log.setPartOfBatch(true)
        //     firstBatch.push(log)
        // }
        // this.batches.push(firstBatch)
        //this.singles.push(this.frog)
        let self = this

        document.addEventListener('touchstart', function (e) {
            this.touchStarted = true
            console.log(e.touches);
            this.touchStartX = e.touches[0].screenX
            this.touchStartY = e.touches[0].screenY
        })

        document.addEventListener('touchend', function (e) {
            this.touchStarted = false
            console.log(e.touches);
            let touchEndX = e.changedTouches[0].screenX
            let touchEndY = e.changedTouches[0].screenY
            let xDiff = this.touchStartX - touchEndX
            let yDiff = this.touchStartY - touchEndY
            console.log("X DIFF: " + xDiff);
            console.log("Y DIFF: " + yDiff);


            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                //x dir swipe
                if (xDiff > 0) {
                    self.frog.setDirection(LEFT);
                }
                else {
                    self.frog.setDirection(RIGHT);
                }
            }
            else {
                if (yDiff > 0) {
                    self.frog.setDirection(UP);
                }
                else {
                    self.frog.setDirection(DOWN);
                }
            }
        })

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
            else if (e.keyCode === 73) {//I - info toggle
                self.engine.boundingBoxOn = !self.engine.boundingBoxOn
                self.engine.includeCoordinates = !self.engine.includeCoordinates
            }
        });

        // let grass = new Surface(0, 0, 3 * TILE_SIZE, TILE_SIZE)
        // grass.setAsset(this.assetHolder.getImage(GRASS_TILE))
        // this.surfaces.push(grass)
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