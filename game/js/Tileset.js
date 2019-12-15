
class Tileset {
    constructor(asset, rows, columns) {
        /**@type {number} - Tile height*/
        this.TILE_HEIGHT = (asset.height / rows);
        /**@type {number} - Tile width*/
        this.TILE_WIDTH = (asset.width / columns);
        this.asset = asset;
    }
}