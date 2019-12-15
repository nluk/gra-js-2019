
class AssetHolder {



    constructor() {
        /**@type {Map<string,HTMLImageElement>}*/
        this.images = new Map()
        /**@type {Array<Promise>}*/
        this.imagePromises = []
    }


   

    /**
     * Registers and loads image
     * 
     * @param {string} assetCode - Code identifying asset
     * @param {string} src - Path to image / image source
     * @memberof AssetHolder
     */
    registerImage(assetCode, src) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {
                self.images.set(assetCode,img)
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
    loadImages(thenFunc) {
        Promise.all(this.imagePromises).then(function () { thenFunc() });
    }

    /**
     * Registers and loads image
     * 
     * @param {string} assetCode - Code identifying asset
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
                self.images.set(assetCode, img);
                resolve();
            };
            img.src = src;
        });
        this.imagePromises.push(promise);
    }


    /**
     *Returns image of asset
     *
     * @param {string} assetCode -
     * @returns {HTMLImageElement}
     * @memberof AssetHolder
     */
    getImage(assetCode) {
        return this.images.get(assetCode)
    }

}

