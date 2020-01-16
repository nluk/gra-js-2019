
class AssetHolder {



    constructor() {
        /**@type {Map<string,HTMLImageElement>}*/
        this.images = new Map()
        /**@type {Map<string,Howl>}*/
        this.sounds = new Map()
        /**@type {Array<Promise>}*/
        this.imagePromises = []
    }


    registerSound(assetCode, src, volume) {
        let sound = new Howl({
            src: [src],
            volume : volume
        });
        this.sounds.set(assetCode, sound);
    }

    registerMainTheme(src, volume){
        let theme = new Howl({
            src: [src],
            volume: volume,
            autoplay: true,
            loop: true
        })
        this.sounds.set(MAIN_THEME,theme)
    }


    getSound(assetCode) {
        return this.sounds.get(assetCode);
    }


    /**
     * Registers and loads image
     * 
     * @param {number} assetCode - Code identifying asset
     * @param {string} src - Path to image / image source
     * @memberof AssetHolder
     */
    registerImage(assetCode, src) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {

                self.images[assetCode] = img
                resolve();
            };
            img.src = src;
        });
        this.imagePromises.push(promise);
    }

    /**
     * Forces images to load and calls imagesReady() on game
     *
     * @param {Game} game
     * @memberof AssetHolder
     */
    loadImages(game) {
        Promise.all(this.imagePromises).then(function () { game.imagesReadyCallback() });
    }

    /**
     * Registers and loads image
     * 
     * @param {number} assetCode - Code identifying asset
     * @param {string} src - Path to image / image source
     * @param {number} width - Width of loaded image
     * @param {number} height - Heihth of loaded image
     * @memberof AssetHolder
     */
    registerImage(assetCode, src, width, height) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image(width, height);
            img.onload = function () {
                //console.log("Image loaded:");
                //console.log(img);
                //console.log("Adding to images");
                //console.log(self.images);
                self.images.set(assetCode, img);
                //console.log("Added");
                //console.log(self.images);

                resolve();
            };
            img.src = src;
        });
        this.imagePromises.push(promise);
    }


    /**
     *Returns image of asset
     *
     * @param {number} assetCode -
     * @returns {HTMLImageElement}
     * @memberof AssetHolder
     */
    getImage(assetCode) {
        //console.log("Requested asset: "+assetCode);
        let asset = this.images.get(assetCode)
        //console.log("Asset: ");
        //console.log(asset);
        return asset
    }

}

