/** @type {AssetHolder}*/
let assetHolder = new AssetHolder()

//Controls
/** @type {HTMLInputElement}*/
let inputGround;
/** @type {HTMLInputElement}*/
let inputItems;
/** @type {HTMLInputElement}*/
let inputRows;
/** @type {HTMLInputElement}*/
let inputColumns;
/** @type {HTMLInputElement}*/
let inputTilesize;
/** @type {HTMLInputElement}*/
let resetButton;
/** @type {HTMLInputElement}*/
let groundRight;
/** @type {HTMLInputElement}*/
let groundLeft;
/** @type {HTMLInputElement}*/
let itemRight;
/** @type {HTMLInputElement}*/
let itemLeft;
/** @type {HTMLCanvasElement}*/
let groundCanvas;
/** @type {HTMLCanvasElement}*/
let itemCanvas;
/** @type {HTMLCanvasElement}*/
let levelCanvas;
/** @type {HTMLInputElement}*/
let saveButton;
/** @type {HTMLSelectElement}*/
let entityTypeSelect;
/** @type {HTMLSelectElement}*/
let entityDirectionSelect;
/** @type {HTMLInputElement}*/
let entityOffsetInput;
/** @type {HTMLInputElement}*/
let useEntityButton;




//Values
/** @type {boolean}*/
let loaded = false
/** @type {Array<string>}*/
let groundTiles = []
/** @type {Array<string>}*/
let itemTiles = []
/** @type {Array<Array<boolean>>}*/
let collisionBoxes = []
/** @type {number}*/
let columns;
/** @type {number}*/
let rows;
/** @type {number}*/
let tileSize = 1;

/** @type {Map<string,object>}*/
let entities = new Map()

/** @type {CanvasRenderingContext2D}*/
let grdCtx;
/** @type {CanvasRenderingContext2D}*/
let itmCtx;
/** @type {CanvasRenderingContext2D}*/
let lvlCtx;


/** @type {number}*/
let screenWidth = 720;
/** @type {number}*/
let maxDisplayedTiles;
/** @type {number}*/
let groundOffset = 0;
/** @type {number}*/
let itemOffset = 0;


let selectedImage = null;

let selectedEntity = null;

let isGroundSelected = false;

/** @type {number}*/
let tileCanvasWidth = 800;
/** @type {number}*/
let tileCanvasHeight = 70;

let horizontalTileSpace = 10;
let verticalTileSpace = 10;

const NONE = 0;
const BACKGROUND = 1;
const ITEM = 2;
const TILE = 3;
const COLLISION_BOXES = 4;
const ENTITY = 5;
const ENTITY_LEFT = "L";
const ENTITY_RIGHT = "R";
let currentMode = NONE;
let currentRotation = 0;

let tileAsBackground = false;

let level;

let displayEntities = false;
let displayCollisions = false;

function reloadAll() {
    tileSize = parseInt(inputTilesize.value)
    rows = parseInt(inputRows.value)
    columns = parseInt(inputColumns.value)
    maxDisplayedTiles = Math.floor((tileCanvasWidth - horizontalTileSpace) / (tileSize + horizontalTileSpace));
    // verticalTileSpace = Math.floor((tileCanvasHeight-tileSize)/2.0)
    resetLevel()
    loadTilesFromInput(groundTiles, inputGround)
    loadTilesFromInput(itemTiles, inputItems)
    levelCanvas.width = columns * tileSize
    levelCanvas.height = rows * tileSize
    tileCanvasHeight = tileSize + 20
    groundCanvas.height = tileCanvasHeight
    itemCanvas.height = tileCanvasHeight
    lvlCtx.imageSmoothingEnabled = false
    grdCtx.imageSmoothingEnabled = false
    itmCtx.imageSmoothingEnabled = false
    assetHolder.loadImages(() => {
        loaded = true;
        redrawTilesets()
    })
}


// function loadEntities(input) {
//     for (const file of input.files) {
//         let reader = new FileReader();
//         reader.onload = function (e) {
//             let contents = e.target.result;
//             let json = JSON.parse(contents);
//             entities.set(json.code, json)
//             let entityOption = document.createElement("option")
//             entityOption.value = json.code
//             entityOption.innerText = json.code
//             entitiesDropdown.appendChild(entityOption)
//         };
//         reader.readAsText(file);
//     }
// }

function xToIndex(x) {
    return Math.floor(x / (tileSize + horizontalTileSpace));
}


function loadTilesFromInput(tileCodeArray, input) {
    for (const file of input.files) {
        let code = file.name.split(".")[0]
        tileCodeArray.push(code)
        assetHolder.registerImage(code, URL.createObjectURL(file))
    }
}

function redrawTilesets() {
    drawTileset(grdCtx, groundTiles, groundOffset)
    drawTileset(itmCtx, itemTiles, itemOffset)
}

function drawTileset(ctx, tiles, currentOffset) {
    let loadedTiles = 0;
    ctx.clearRect(0, 0, tileCanvasWidth, tileCanvasHeight);
    for (let i = currentOffset; i < tiles.length && loadedTiles < maxDisplayedTiles; i++) {
        let tileCode = tiles[i];
        ctx.drawImage(assetHolder.getImage(tileCode), (i - currentOffset) * (tileSize + horizontalTileSpace) + horizontalTileSpace, verticalTileSpace, tileSize, tileSize);
        loadedTiles++;
        ctx.strokeStyle = 'black 1px';
        ctx.strokeRect((i - currentOffset) * (tileSize + horizontalTileSpace) + horizontalTileSpace, verticalTileSpace, tileSize, tileSize)
    }
}

function mouseRelativeToElement(element, evt) {
    let rect = element.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / (rect.right - rect.left) * element.width),
        y: Math.floor((evt.clientY - rect.top) / (rect.bottom - rect.top) * element.height)
    };
}

function addListeners() {
    changeBtn.onclick = () => reloadAll()
    itemRight.onclick = () => {
        itemOffset = incrOffset(itemOffset, itemTiles.length)
        redrawTilesets()
    }
    groundRight.onclick = () => {
        groundOffset = incrOffset(groundOffset, groundTiles.length)
        redrawTilesets()
    }
    itemLeft.onclick = () => {
        itemOffset = decrOffset(itemOffset)
        redrawTilesets()
    }
    groundLeft.onclick = () => {
        groundOffset = decrOffset(groundOffset)
        redrawTilesets()
    }
    groundCanvas.onclick = (event) => {
        let index = xToIndex(mouseRelativeToElement(groundCanvas, event).x) + groundOffset
        changeSelectedTile(groundTiles, index)
        currentMode = tileAsBackground ? BACKGROUND : TILE
        renderLevel()
    }

    itemCanvas.onclick = (event) => {
        let index = xToIndex(mouseRelativeToElement(itemCanvas, event).x) + itemOffset
        changeSelectedTile(itemTiles, index)
        currentMode = ITEM
        renderLevel()
    }

    levelCanvas.onmousemove = (event) => {
        let relativePos = mouseRelativeToElement(levelCanvas, event)
        //console.log("Position: "+relativePos.x+" , "+relativePos.y);
        let row = Math.floor(relativePos.y / tileSize)
        let column = Math.floor(relativePos.x / tileSize)
        //console.log("level["+column+"]["+row+"]");
        renderLevel()
        renderSelection(row, column)
        renderMode(relativePos.x, relativePos.y)
    }

    levelCanvas.onclick = (event) => {
        if (loaded) {
            let relativePos = mouseRelativeToElement(levelCanvas, event)
            console.log("Position: " + relativePos.x + " , " + relativePos.y);
            let row = Math.floor(relativePos.y / tileSize)
            let column = Math.floor(relativePos.x / tileSize)
            console.log("level[" + column + "][" + row + "]");
            if (currentMode == TILE) {
                if (level[column][row].tile == selectedImage) {
                    level[column][row].tile = null
                }
                else {
                    level[column][row].tile = selectedImage
                    level[column][row].tileRotation = currentRotation
                }
            }
            else if (currentMode == ITEM) {
                if (level[column][row].item == selectedImage) {
                    level[column][row].item = null
                }
                else {
                    level[column][row].item = selectedImage
                }
            }
            else if (currentMode == BACKGROUND) {
                if (level[column][row].background == selectedImage) {
                    level[column][row].background = null
                }
                else {
                    level[column][row].background = selectedImage
                    level[column][row].backgroundRotation = currentRotation
                }
            }
            else if (currentMode == COLLISION_BOXES) {
                collisionBoxes[column][row] = !collisionBoxes[column][row]
            }
            else if (currentMode == ENTITY) {
                console.log("Level: ");
                console.log(level[column][row].entity);
                console.log("Selection: ");
                console.log(selectedEntity);


                if (level[column][row].entity == null || level[column][row].entity.type != selectedEntity.type) {
                    level[column][row].entity = selectedEntity
                }
                else {
                    level[column][row].entity = null
                }

            }

            renderLevel()
        }

    }

    resetButton.onclick = () => {
        console.log(this);
    }

    document.addEventListener('keydown', function (e) {

        console.log(this);


        if (e.keyCode === 66)  // B
        {
            tileAsBackground = !tileAsBackground
            if (currentMode == BACKGROUND || currentMode == TILE) {
                currentMode = tileAsBackground ? BACKGROUND : TILE;
            }
        }
        else if (e.keyCode === 67) { //C
            currentMode = COLLISION_BOXES
        } 
        else if (e.keyCode === 82) { //R
            currentMode = ROTATION
        }
        else if (e.keyCode === 32) { //Space
            e.preventDefault()
            currentRotation = (currentRotation + 1) % 4;
            console.log(currentRotation * 90);
        }
        else if (e.keyCode == 69) { //E
            displayEntities = !displayEntities
        }
        else if (e.keyCode == 75) { //K
            displayCollisions = !displayCollisions
        }
        renderLevel()

    });

    // entitiesDropdown.onchange = (selection) => {
    //     selectedEntity = entities.get(entitiesDropdown.selectedOptions[0].text)
    //     currentMode = ENTITY
    // }

    // entitiesDropdown.onselectionchange = (selection) => {
    //     alert(selection.value)
    //     console.log(selection);
    //     selectedEntity = entities.get(selection.value)
    //     currentMode = ENTITY
    // }

    // entitiesDropdown.onselect = (selection) => {
    //     alert(selection.value)
    //     console.log(selection);
    //     selectedEntity = entities.get(selection.value)
    //     currentMode = ENTITY
    // }

    saveButton.onclick = () => saveLevel()

    useEntityButton.onclick = () => {
        selectedEntity = {
            direction: entityDirectionSelect.selectedOptions[0].value,
            offset: entityOffsetInput.valueAsNumber,
            type: entityTypeSelect.selectedOptions[0].value
        }
        console.log(selectedEntity);
        currentMode = ENTITY
    }

    // levelCanvas.addEventListener('mouseup',function(e){
    //     if (typeof e === 'object' && e.button == 2){
    //         e.preventDefault()

    //     }
    // })

}

function saveLevel() {
    let optCollisions = new Array(rows)
    for (let i = 0; i < rows; i++) {
        optCollisions[i] = new Array()
    }

    let lvl = new Array(columns)
    for (let i = 0; i < columns; i++) {
        lvl[i] = new Array(rows)
        for (let j = 0; j < rows; j++) {
            let cell = level[i][j]
            
            if (cell.entity == null || cell.entity == undefined) {
                lvl[i][j] = { b: cell.background, t: cell.tile, i: cell.item, r: cell.tileRotation, e: null }
                console.log("null");
                
            }
            else {
                lvl[i][j] = { b: cell.background, t: cell.tile, i: cell.item, r: cell.tileRotation, e: cell.entity }
                console.log(cell.entity);
                
            }

        }
    }
    let colSpan = 0;
    let colStart = null

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (collisionBoxes[j][i]) {
                if (colStart == null) {
                    colStart = j
                }
                colSpan++
            }
            else {
                if (colSpan > 0) {
                    optCollisions[i].push({ s: colStart, l: colSpan })
                    colStart = null
                    colSpan = 0
                }
            }
        }
        if (colSpan > 0) {
            optCollisions[i].push({ s: colStart, l: colSpan })
            colStart = null
            colSpan = 0
        }
    }

    let levelJSON = JSON.stringify({
        levelData: lvl,
        collistionData: optCollisions
    });
    let saveAnchor = document.createElement('a');
    saveAnchor.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(levelJSON));
    saveAnchor.setAttribute('download', "level.txt");
    saveAnchor.click()
}

function renderSelection(row, column) {
    if (loaded) {
        if (currentMode == COLLISION_BOXES) {
            lvlCtx.globalAlpha = 1.0
            lvlCtx.strokeStyle = 'green';
            lvlCtx.strokeRect(column * tileSize, row * tileSize, tileSize, tileSize)
        }
        else if (currentMode == ENTITY) {
            lvlCtx.globalAlpha = 1.0
            lvlCtx.strokeStyle = 'green';
            lvlCtx.strokeRect(column * tileSize, row * tileSize, tileSize, tileSize)
            lvlCtx.font = "10px Georgia"
            lvlCtx.fillText(selectedEntity.type + ":" + selectedEntity.direction + ":" + selectedEntity.offset, (column * tileSize) + (tileSize / 4), (row * tileSize) + (tileSize / 2))
        }
        else if (selectedImage != null) {
            let x = (column * tileSize) + (tileSize / 2)
            let y = (row * tileSize) + (tileSize / 2)
            lvlCtx.save()
            lvlCtx.translate(x, y);
            lvlCtx.rotate(Math.degToRad(currentRotation * 90.0))
            //lvlCtx.translate(column*-tileSize,row*-tileSize);
            lvlCtx.globalAlpha = 0.3
            lvlCtx.drawImage(assetHolder.getImage(selectedImage), -tileSize / 2, -tileSize / 2, tileSize, tileSize)
            lvlCtx.restore()
        }

    }
}

function renderMode(x, y) {
    if (loaded) {
        let modeStr;
        if (currentMode == NONE) {
            modeStr = "NONE"
        }
        else if (currentMode == BACKGROUND) {
            modeStr = "BACKGROUND"
        }
        else if (currentMode == ITEM) {
            modeStr = "ITEM"
        }
        else if (currentMode == TILE) {
            modeStr = "TILE"
        }
        else if (currentMode == COLLISION_BOXES) {
            modeStr = "COLLISIONS"
        }
        else if (currentMode == ENTITY) {
            modeStr = "ENTITY"
        }
        lvlCtx.font = "10px Georgia"
        lvlCtx.fillText(modeStr, x, y)
    }
}

function renderLevel() {
    if (loaded) {
        lvlCtx.globalAlpha = 1.0
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                let cell = level[i][j]
                let x = i * tileSize;
                let y = j * tileSize;
                let centreX = x + (tileSize / 2)
                let centreY = y + (tileSize / 2)
                lvlCtx.clearRect(x, y, tileSize, tileSize)
                /*
                let x = (column*tileSize) + (tileSize/2)
            let y = (row*tileSize) + (tileSize/2)
            lvlCtx.save()
            lvlCtx.translate(x,y);
            lvlCtx.rotate(Math.degToRad(currentRotation*90.0))
            //lvlCtx.translate(column*-tileSize,row*-tileSize);
            lvlCtx.globalAlpha = 0.3
            lvlCtx.drawImage(assetHolder.getImage(selectedImage),-tileSize/2,-tileSize/2,tileSize,tileSize)
            lvlCtx.restore()*/
                if (cell.background != null) {
                    lvlCtx.save()
                    lvlCtx.translate(centreX, centreY);
                    lvlCtx.rotate(Math.degToRad(cell.backgroundRotation * 90))
                    // lvlCtx.translate(i*-tileSize,j*-tileSize);
                    lvlCtx.drawImage(assetHolder.getImage(cell.background), -tileSize / 2, -tileSize / 2, tileSize, tileSize)
                    lvlCtx.restore()
                }
                if (cell.tile != null) {
                    // lvlCtx.save()
                    // lvlCtx.translate(i*tileSize,j*tileSize);
                    // lvlCtx.rotate(Math.degToRad(cell.tileRotation*90))
                    // lvlCtx.translate(i*-tileSize,j*-tileSize);
                    // lvlCtx.drawImage(assetHolder.getImage(cell.tile),i*tileSize,j*tileSize,tileSize,tileSize)
                    // lvlCtx.restore()
                    lvlCtx.save()
                    lvlCtx.translate(centreX, centreY);
                    lvlCtx.rotate(Math.degToRad(cell.tileRotation * 90))
                    // lvlCtx.translate(i*-tileSize,j*-tileSize);
                    lvlCtx.drawImage(assetHolder.getImage(cell.tile), -tileSize / 2, -tileSize / 2, tileSize, tileSize)
                    lvlCtx.restore()
                }
                if (cell.item != null) {
                    lvlCtx.drawImage(assetHolder.getImage(cell.item), i * tileSize, j * tileSize, tileSize, tileSize)
                }
                if (currentMode == COLLISION_BOXES || displayCollisions) {
                    lvlCtx.strokeStyle = 'red';
                    if (collisionBoxes[i][j] == true) {
                        lvlCtx.strokeRect(i * tileSize, j * tileSize, tileSize, tileSize)
                    }

                }
                if ((currentMode == ENTITY || displayEntities) && cell.entity != null) {
                    lvlCtx.fillText(cell.entity.type + ":" + cell.entity.direction + ":" + cell.entity.offset, (i * tileSize) + (tileSize / 4), (j * tileSize) + (tileSize / 2))
                }
            }

        }
    }
}

function changeSelectedTile(tileset, index) {
    if (index < tileset.length) {
        selectedImage = tileset[index]
    }
}



function incrOffset(offset, itemsCount) {
    if (loaded && (offset + 1 + maxDisplayedTiles) < itemsCount) {
        offset++;
    }
    return offset;

}

function decrOffset(offset) {
    if (loaded && offset - 1 >= 0) {
        offset--;
    }
    return offset;
}

window.addEventListener('DOMContentLoaded', (event) => {
    changeBtn = document.getElementById("change");
    inputGround = document.getElementById("ground");
    inputItems = document.getElementById("items");
    inputRows = document.getElementById("rows");
    inputColumns = document.getElementById("columns");
    inputTilesize = document.getElementById("tileSize");
    groundLeft = document.getElementById("groundLeft");
    groundRight = document.getElementById("groundRight")
    itemLeft = document.getElementById("itemLeft")
    itemRight = document.getElementById("itemRight")
    groundCanvas = document.getElementById("groundCanvas");
    grdCtx = groundCanvas.getContext("2d");
    grdCtx.imageSmoothingEnabled = false;
    itemCanvas = document.getElementById("itemCanvas");
    itmCtx = itemCanvas.getContext("2d");
    itmCtx.imageSmoothingEnabled = false;
    levelCanvas = document.getElementById("levelCanvas");
    lvlCtx = levelCanvas.getContext("2d");
    lvlCtx.imageSmoothingEnabled = false;
    resetButton = document.getElementById("resetLevel");
    saveButton = document.getElementById("saveLevel")
    entityDirectionSelect = document.getElementById("entityDirectionSelect")
    entityTypeSelect = document.getElementById("entityTypeSelect")
    entityOffsetInput = document.getElementById("entityOffset")
    useEntityButton = document.getElementById("useEntityButton")
    addListeners();
});

function createLevelEntry() {
    return {
        item: null,
        tile: null,
        background: null,
        backgroundRotation: 0,
        enitity: null,
        tileRotation: 0
    }
}


function resetLevel() {
    level = new Array(columns)
    collisionBoxes = new Array(columns)
    for (let i = 0; i < level.length; i++) {
        level[i] = new Array(rows)
        collisionBoxes[i] = new Array(rows)
        for (let j = 0; j < level[i].length; j++) {
            level[i][j] = createLevelEntry()
            collisionBoxes[i][j] = false;
        }
    }
    renderLevel()
}

Math.degToRad = (deg) => {
    return deg * Math.PI / 180.0
}