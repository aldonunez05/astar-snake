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

function randomCell(){
    return [
        Math.floor(Math.random() * GRID_WIDTH),
        Math.floor(Math.random() * GRID_HEIGHT)
    ]
}

let score = 0
let snake = [[5,5]]
let direction = "RIGHT"
let food = randomCell()


function key(x,y){
    return y * GRID_WIDTH + x
}

function draw(){
    ctx.fillStyle = BLACK
    ctx.fillRect(0,0, canvas.width, canvas.height)

    ctx.fillStyle = RED
    ctx.fillRect(food[0] * CELL_SIZE, food[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE)

    ctx.fillStyle = GREEN
    for (const[x, y] of snake){
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
}

function step(){
    const [dx, dy] = DIRECTIONS[direction]
    const head = snake[0]
    const newHead = [head[0] + dx, head[1] + dy]

    const hitWall = newHead[0] < 0 || newHead[0] >= GRID_WIDTH ||
                    newHead[1] < 0 || newHead[1] >= GRID_HEIGHT
    const hitSelf = snake.some(([x,y]) => x === newHead[0] && y === newHead[1])

    if (hitWall || hitSelf){
        console.log(`Game Over! Score: ${score}`)
        clearInterval(timer)
        return
    }

    snake.unshift(newHead)
    if(newHead[0] === food[0] && newHead[1] === food[1]){
        score += 1
        food = randomCell()
        while(snake.some(([x, y]) => x === food[0] && y === food[1])){
            food = randomCell()
        }
    } else {
        snake.pop()
    }

    draw()
}

document.addEventListener("keydown", (e) => {
    const keys = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT" }
    if (keys[e.key]) direction = keys[e.key]
})
const timer = setInterval(step, 100)
