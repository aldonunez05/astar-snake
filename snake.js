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

    ctx.fillStyle = WHITE
    ctx.font = "20px Arial"
    ctx.textBaseline = "top"
    ctx.fillText(`Score: ${score}`, 10, 10)
}

function drawGameOver(){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = WHITE
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.font = "40px Arial"
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20)

    ctx.font = "20px Arial"
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20)
}


function heuristic(a, b){
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

function aStarPath(start, goal, obstacles){
    const frontier = [[0, start]]
    const cameFrom = new Map([[key(...start), null]])
    const costSoFar = new Map([[key(...start), 0]])

    while (frontier.length > 0){
        frontier.sort((a, b) => a[0] - b[0])
        const [, current] = frontier.shift()

        if (current[0] === goal[0] && current[1] === goal[1]) break

        for (const [dx, dy] of Object.values(DIRECTIONS)){
            const neighbor = [current[0] + dx, current[1] + dy]
            const k = key(...neighbor)

            if (neighbor[0] >= 0 && neighbor[0] < GRID_WIDTH &&
                neighbor[1] >= 0 && neighbor[1] < GRID_HEIGHT &&
                !obstacles.has(k) && !costSoFar.has(k)){
                const cost = costSoFar.get(key(...current)) + 1
                costSoFar.set(k, cost)
                frontier.push([cost + heuristic(neighbor, goal), neighbor])
                cameFrom.set(k, current)
            }
        }
    }
    const path = []
    let current = goal
    while (cameFrom.has(key(...current)) && cameFrom.get(key(...current)) !== null){
        path.push(current)
        current = cameFrom.get(key(...current))
    }
    path.reverse()
    return path
}

function floodFillArea(start, obstacles){
    const visited = new Set([key(...start)])
    const stack = [start]

    while (stack.length > 0){
        const current = stack.pop()

        for (const [dx, dy] of Object.values(DIRECTIONS)){
            const neighbor = [current[0] + dx, current[1] + dy]
            const k = key(...neighbor)

            if (neighbor[0] >= 0 && neighbor[0] < GRID_WIDTH &&
                neighbor[1] >= 0 && neighbor[1] < GRID_HEIGHT &&
                !obstacles.has(k) && !visited.has(k)){
                visited.add(k)
                stack.push(neighbor)
            }
        }
    }
    return visited.size
}

function simulateEating(body, path, target){
    const sim = body.slice()

    for (const step of path){
        sim.unshift(step)
        if (step[0] !== target[0] || step[1] !== target[1]){
            sim.pop()
        }
    }
    return sim
}

function isPathSafe(body, path, target){
    const sim = simulateEating(body, path, target)
    const tail = sim[sim.length - 1]
    const obstacles = new Set(sim.slice(0, -1).map(([x, y]) => key(x, y)))

    return aStarPath(sim[0], tail, obstacles).length > 0
}

function safestMove(body){
    const obstacles = new Set(body.slice(0, -1).map(([x, y]) => key(x, y)))
    let bestMove = direction
    let bestArea = -1

    for (const [name, [dx, dy]] of Object.entries(DIRECTIONS)){
        const neighbor = [body[0][0] + dx, body[0][1] + dy]
        const k = key(...neighbor)

        if (neighbor[0] >= 0 && neighbor[0] < GRID_WIDTH &&
            neighbor[1] >= 0 && neighbor[1] < GRID_HEIGHT &&
            !obstacles.has(k)){
            const area = floodFillArea(neighbor, obstacles)
            if (area > bestArea){
                bestArea = area
                bestMove = name
            }
        }
    }
    return bestMove
}

function getNextMove(){
    const obstacles = new Set(snake.map(([x,y]) => key(x,y)))
    const path = aStarPath(snake[0], food, obstacles)

    if (path.length > 0 && isPathSafe(snake, path, food)){
        const next = path[0]
        for(const [name, [dx, dy]] of Object.entries(DIRECTIONS)){
            if (snake[0][0] + dx === next[0] && snake[0][1] + dy === next[1]){
                return name
            }
        }
    }
    return safestMove(snake) 
}

function step(){
    direction = getNextMove()
    const [dx, dy] = DIRECTIONS[direction]
    const head = snake[0]
    const newHead = [head[0] + dx, head[1] + dy]

    const hitWall = newHead[0] < 0 || newHead[0] >= GRID_WIDTH ||
                    newHead[1] < 0 || newHead[1] >= GRID_HEIGHT
    
    const eating = newHead[0] === food[0] && newHead[1] === food[1]
    const body = eating ? snake : snake.slice(0, -1)    
    const hitSelf = body.some(([x,y]) => x === newHead[0] && y === newHead[1])

    if (hitWall || hitSelf){
        console.log(`Game Over! Score: ${score}`)
        clearInterval(timer)
        drawGameOver()
        return
    }

    snake.unshift(newHead)
    if(eating){
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

draw()
const timer = setInterval(step, 100)
