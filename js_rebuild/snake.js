const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


const CELL_SIZE = 20
const GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE)
const GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE)

const BLACK = "rgb(0,0,0)"
const WHITE = "rgb(255, 255, 255)"
const GREEN = "rgb(0,255, 0)"
const RED   = "rgb(255, 0, 0)"


const DIRECTIONS = {"UP": [0, -1], "DOWN": [0, 1], "LEFT": [-1, 0], "RIGHT": [1, 0]}
