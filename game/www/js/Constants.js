//DIRECTIONS
const UP = 0;
const LEFT = 1;
const DOWN = 2;
const RIGHT = 3;
const STOPPED = 4;
const START = 5;

//STATUSES
const ALIVE = 0
const DEAD = 1


//ASSETS
const FROG = "FROG";
const WATER_TILE = "WATER_TILE";
const GRASS_TILE = "GRASS_TILE";
const FROG_TILESET = "FROG_TILESET";
const CROC_TILESET = "CROC_TILESET";
const WATER_SPLASH = "WATER_SPLASH";
const WOODEN_LOG = "log";
const LILY_PAD = "lily";
const SPLASH = "SPLASH";
const CROC = FROG;
const CAR = "CAR";
const CAR_HIT = "CAR_HIT";
const BLOOD_TILESET = "BLOOD_TILESET";
const EXIT = "EXIT";

//DIMENSIONS
let TILE_SIZE = 50;
let BOUNDS_OFFSET=10;

//SOUNDS
const FROG_JUMP = "0";
const MAIN_THEME = "1";

//COLLISION_TYPES
const COLLISION_SURFACE = 0;
const COLLISION_ENEMY = 1;
const COLLISTION_NONE = 2;
const COLLISTION_WINNER = 3;

//STARTING_DIRECTIONS
const START_LEFT = "L"
const START_RIGHT = "R"

//SPEED
const FROG_SPEED = 10
const LOG_SPEED = 7
const CAR_SPEED = 15