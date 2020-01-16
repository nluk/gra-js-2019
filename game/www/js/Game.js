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
        this.dialogDisplayed = false
        this.startTime = null
        this.finishTime = null
        this.tapStarted = false
        this.topScores = []
    }

    registerAssets() {
        for (let i = 1; i <= 17; i++) {
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
        this.assetHolder.registerImage(BLOOD_TILESET, "./img/BLOOD_TILESET.png")
        this.assetHolder.registerImage(WATER_SPLASH, "./img/SPLASH.png")
        this.assetHolder.registerImage(WOODEN_LOG, "./img/WOODEN_LOG.png")
        this.assetHolder.registerImage(CAR, "./img/CAR2.png")
        this.assetHolder.registerImage(EXIT, "./img/APPLE.png")
        this.assetHolder.registerSound(FROG_JUMP, "./sound/FROG_JUMP.ogg", 0.05)
        this.assetHolder.registerSound(SPLASH, "./sound/SPLASH.flac", 0.3)
        this.assetHolder.registerSound(CAR_HIT, "./sound/CAR_HIT.mp3",0.3)
        this.assetHolder.registerMainTheme("./sound/MAIN.ogg",0.4)
    }

    checkCollision() {
        if (this.frog.isSticked) return
        this.frog.setCollision(COLLISTION_NONE)

        for (let i = 0; i < this.surfaces.length; i++) {
            this.checkCollisionRectangles(this.frog, this.surfaces[i])
        }
        for (let i = 0; i < this.tileCollisions.length; i++) {
            this.checkCollisionTiles(this.frog, this.tileCollisions[i])
        }
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.checkCollisionRectangles(this.frog, this.gameObjects[i])
        }
        

    }

    outsideBounds(object){
        //if(direction==START_LEFT) console.log("X: "+x+" , Y:"+y);
        
        if(object.direction == START_LEFT){
            return (object.x+object.width) < -BOUNDS_OFFSET || (object.y+object.height) < -BOUNDS_OFFSET;
        }
        else{
            return object.x > (this.width+BOUNDS_OFFSET) || object.y > (this.height+BOUNDS_OFFSET);
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
            if (this.outsideBounds(object)) {
                object.resetToInitialPosition()
            }
        }
        if(this.frog.hasWon){
            this.dialogDisplayed = true
            this.tapStarted = false
            this.finishTime = this.getCurrentTime()
            let topScoresRef = database.ref("scores").orderByChild("time").limitToFirst(3)
            let self = this
            
            
            
            topScoresRef.once('value', function(snapshot) {
                let topScores = []
                snapshot.forEach(function(childSnapshot) {
                    topScores.push(childSnapshot.val())
                });
                let message = "Your score: "+self.finishTime+"\nTop scores:"
                let i = 1;
                for (const score of topScores) {
                    message += "\n"+i+".  "+score.user+" : "+score.time
                    i++
                }
                navigator.notification.prompt(
                message,  // message
                function callback(results) {
                    self.scoreSubmit(results,self)
                },                  // callback to invoke
                'Submit score',            // title
                ['Submit','Cancel']              // buttonLabels
                );


              });

            
            
            

        }
        else if(this.frog.status == DEAD && !this.dialogDisplayed){
            this.dialogDisplayed = true
            let self = this;


            navigator.notification.alert(
                'Restart level?',  // message
                function callback() {
                    self.restartGame(self)
                },         // callback
                'Game Over',            // title
                'Restart'                  // buttonName
            );
            navigator.vibrate(2000);
        }
    }

    scoreSubmit(results,self){
        let time = self.finishTime;
        console.log(results);
        
        if(results.buttonIndex==1 && results.input1){// Submit clicked
            let newScore = database.ref("scores").push()
            newScore.set({
                user: results.input1,
                time: time 
            })
        
        }
        self.restartGame(self)
    }

    getCurrentTime(){
       return Number(((performance.now() - this.startTime)/1000.0).toFixed(2))
    }

    restartGame(game){
        game.dialogDisplayed = false
        console.log(game);
        console.log(game.frog);
        
        
        game.frog.restart()
        game.startTime = null
        game.play()
    }

    play() {
            if(this.startTime == null && this.tapStarted){
                this.startTime = performance.now()
            }
            this.render();
            if(!this.dialogDisplayed){
                this.checkCollision();
                this.checkStatus()
            }
            requestAnimationFrame(this.play.bind(this));
        
    }

    checkCollisionRectangles(frog, object) {
        if (frog.x < object.x + object.width &&
            frog.x + frog.width > object.x &&
            frog.y < object.y + object.height &&
            frog.y + frog.height > object.y) {
            console.log(object.getCollisionType());
            
            frog.setCollision(object.getCollisionType());
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
       // this.assetHolder.getSound(MAIN_THEME).play()
        this.play()
    }

    loadLevel() {
        let lvlString = '{"levelData":[[{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"12i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"10i","r":0,"e":null},{"b":"8","t":"6","i":"2i","r":2,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"2","i":"4i","r":2,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"4","i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null}],[{"b":"8","t":"3","i":"5i","r":1,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"3","i":null,"r":3,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":{"direction":"R","offset":-3,"type":"log"}},{"b":"8","t":"4","i":"1i","r":3,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"15","i":"10i","r":2,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null}],[{"b":"8","t":"4","i":null,"r":3,"e":{"direction":"R","offset":0,"type":"frog"}},{"b":"8","t":"3","i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":{"direction":"R","offset":-4,"type":"log"}},{"b":"15","t":null,"i":"14i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"15","i":"11i","r":3,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"4","i":"2i","r":1,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"17","t":"4","i":"7i","r":2,"e":null}],[{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":2,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"13i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"12i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"15","i":null,"r":3,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"2","i":"1i","r":3,"e":null},{"b":"8","t":"3","i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":{"direction":"R","offset":-10,"type":"log"}},{"b":"15","t":null,"i":"13i","r":0,"e":null},{"b":"17","t":"2","i":null,"r":2,"e":{"direction":"R","offset":0,"type":"exit"}}],[{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"17","t":"14","i":null,"r":1,"e":null},{"b":"15","t":null,"i":"12i","r":0,"e":null},{"b":"15","t":null,"i":"14i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"15","i":null,"r":2,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"15","i":null,"r":3,"e":null},{"b":"15","t":null,"i":"10i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"10i","r":0,"e":null},{"b":"17","t":"4","i":null,"r":3,"e":null}],[{"b":"15","t":null,"i":"10i","r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":2,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"17","t":"13","i":"6i","r":1,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"4","i":"1i","r":2,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"4","i":null,"r":1,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"13i","r":0,"e":null}],[{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"17","t":"14","i":"7i","r":3,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"2","i":null,"r":2,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":null},{"b":"8","t":"4","i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"12i","r":0,"e":null},{"b":"15","t":null,"i":"12i","r":0,"e":null}],[{"b":"15","t":"2","i":"1i","r":1,"e":null},{"b":"15","t":"1","i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":{"direction":"L","offset":6,"type":"log"}},{"b":"15","t":null,"i":"11i","r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"8","t":"2","i":null,"r":2,"e":null},{"b":"15","t":"16","i":null,"r":2,"e":{"direction":"L","offset":10,"type":"car"}},{"b":"8","t":"15","i":null,"r":2,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":null,"r":0,"e":null},{"b":"15","t":null,"i":"11i","r":0,"e":null}]],"collistionData":[[{"s":1,"l":2},{"s":7,"l":1}],[{"s":0,"l":1},{"s":2,"l":1},{"s":7,"l":1}],[],[{"s":2,"l":2}],[],[{"s":0,"l":1},{"s":4,"l":3}],[{"s":0,"l":2},{"s":4,"l":1}],[{"s":3,"l":2}],[],[{"s":0,"l":2},{"s":5,"l":3}],[{"s":0,"l":8}],[{"s":0,"l":4},{"s":5,"l":2}],[{"s":3,"l":2}],[],[{"s":3,"l":2},{"s":6,"l":1}],[{"s":2,"l":5}]]}'
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
                    if(data.e.type=="frog"){
                        this.frog = this.factory.newObject(data.e, i * TILE_SIZE, j * TILE_SIZE)
                    }
                    else {
                        let object = this.factory.newObject(data.e, i * TILE_SIZE, j * TILE_SIZE);
                        this.gameObjects.push(object)
                        this.singles.push(object)
                    }
                    //console.log(data.e.type);
                    
                    
                }

            }

        }
        let collisionData = lvl.collistionData
        let rowNo = 0
        for (const rowCollisions of collisionData) {
            for (const collision of rowCollisions) {
                //console.log(collision);
               // console.log("Starting at: " + collision.s + " | length: " + collision.l);

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

        document.addEventListener('click', function (e) {
            console.log("Clicked!");
            self.tapStarted = true
        })

        document.addEventListener('touchstart', function (e) {
            this.touchStarted = true
            console.log(e.touches);
            this.touchStartX = e.touches[0].screenX
            this.touchStartY = e.touches[0].screenY
        })


        document.addEventListener("pause", function () {
            self.assetHolder.getSound(MAIN_THEME).mute(true)
        }, false);
        document.addEventListener("resume", function () {
            self.assetHolder.getSound(MAIN_THEME).mute(false)
        }, false);


        document.addEventListener('touchend', function (e) {
            if(!self.tapStarted) return
            
            
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
        this.frog.start()
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
        if(this.tapStarted){
            this.engine.renderTime(this.getCurrentTime())
        }
        else{
            
            
            this.engine.renderInfo("TAP TO START")
        }
        this.engine.drawObject(this.frog)
        this.engine.toggleFrameBuffer()
    }





}