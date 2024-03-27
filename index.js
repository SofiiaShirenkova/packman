document.addEventListener("DOMContentLoaded", function() {
  
const canvas = document.querySelector('canvas')
var heightRatio = 1.5;
canvas.height = canvas.width * heightRatio;

const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl') //счётчик баллов - съеденых точечек



let state = 'study'

let canvasHTML = document.getElementById("packmanCanvas");


canvas.width = innerWidth * 0.94
canvas.height = innerHeight * 0.93

// function resize() {
//     canvas.width = innerWidth * 0.94
//     canvas.height = innerHeight * 0.93
// }

// function clearCanvas(canvas) {
// 	canvas.width = canvas.width;
// }

const marleft = (innerWidth - canvas.width) / 2;
console.log(marleft)
canvasHTML.style.marginLeft = marleft;


let minedge = Math.min(canvas.height, canvas.width)

let animationId

class Boundary {
    static width = minedge / 23 // создали статическое значение ширины и высоты границы
    static height = minedge / 23
    constructor({ position }) { //square
        this.position = position
        this.width = minedge / 23
        this.height = minedge / 23

        // this.image = image
    }

    
    draw() {
            c.fillStyle = '#00ff00'
            c.fillRect(this.position.x - 1, this.
            position.y - 1, this.width + 1, this.height + 1)
    
            //c.drawImage(this.image, this.position.x, this.position.y)
        }
    }

class Player { //packman
    static speed = (4 / 40) * Boundary.height
    constructor ({
        position,
        velocity }) {
        this.position = position 
        this.velocity = velocity //speed
        this. radius = (15 / 40) * Boundary.width //увеличили радиус самого пакмана (до этого был 10) !! ПОДУМАТЬ КАК СДЕЛАТЬ АДАПТИВНОСТЬ
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0 
    }

    draw() { //создаём дугу - круг - пакман
        c.save() //режим сохранения и обновления
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation) //делаем так, чтобы пакман крутился при движениии -- число pi значит, что ты поворачиваешься на 180 гард прот час стрелки (Math.PI) -- поменяли на зис.ротатион 
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc (this.position.x, this.position.y, this.radius,
        this.radians, Math.PI * 2 - this.radians)
        c.lineTo (this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw() //вызываем предыдущий код с драв
        this.position.x += this.velocity.x //каждый раз мы просто добавляем к скорости игрока х или у
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > 0.75) this.openRate = - this.openRate
            this.radians += this.openRate
    }
}

class Ghost { 
    static speed = 2
    constructor ({
        position, velocity, color = 'red' }) {
        this.position = position 
        this.velocity = velocity 
        this. radius = (15 / 40) * Boundary.width
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false 
    }

    draw() { 
        c.beginPath()
        c.arc (this.position.x, this.position.y, this.radius,
        0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color //меняем цвет призрака при поедании паверапа
        c.fill()
        c.closePath()
    }

    update() {
        this.draw() 
        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y
    }
}

class Pellet { //food
    constructor ({position }) {
        this.position = position 
        this. radius = (2 / 40) * Boundary.width //увеличили радиус самого пакмана (до этого был 10) !! ПОДУМАТЬ КАК СДЕЛАТЬ АДАПТИВНОСТЬ
    }

    draw() { //создаём дугу - круг - пакман
        c.beginPath()
        c.arc (this.position.x, this.position.y, this.radius,
        0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class PowerUp {
    constructor ({position }) {
        this.position = position 
        this. radius = (8 / 40) * Boundary.width
    }

    draw() { 
        c.beginPath()
        c.arc (this.position.x, this.position.y, this.radius,
        0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

const pellets = []
const powerUps = []
const boundaries = [] 
const ghosts = [
    new Ghost ({
        position: {
            x: Boundary.width * 18 + Boundary.width * 2.5,  
            y: Boundary.height + Boundary.height * 1.5
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost ({
        position: {
            x: Boundary.width * 18 + Boundary.width * 2.5,  
            y: Boundary.height * 19 + Boundary.height * 1.5
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost ({
        position: {
            x: Boundary.width * 1 + Boundary.width * 2.5,  
            y: Boundary.height * 19 + Boundary.height * 1.5
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost ({
        position: {
            x: Boundary.width * 18 + Boundary.width * 2.5,  
            y: Boundary.height * 7 + Boundary.height * 1.5
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    })
    
]

const player = new Player ({
    position: {
        x: Boundary.width + Boundary.width * 2.5 , //ширина границы + 1\2 ширины границы = серидина границы 
        y: Boundary.height + Boundary.height * 1.5
    },
    velocity: {
        x:0,
        y:0
    }
})

// создаём переменные букв (кнопок) - определяет, какие кнопки нажимаются
const keys = {
    w: {
        pressed: false //нажата w  по умолчанию ? - нет - false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const map = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' '],
    [' ', '-', ' ', '.', '.', '.', '.', '.', '.', '.', 'p', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '-', ' '],
    [' ', '-', '.', '-', '-', '-', '.', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '.', '-', '-', '-', '.', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '-', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '-', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '-', '-', '.', '.', '.', '-', '.', '.', '.', '-', '-', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '-', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '-', 'p', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '-', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '.', '.', '-', '-', '-', '.', '.', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '.', '.', '-', '-', '-', '.', '.', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '-', '-', '.', '-', '-', '.', '-', '-', '-', '-', '.', '-', '-', '-', '.', '-', '-', '-', '-', '-', '.', '-', '-', '-', '.', '-', '-', '-', '-', '.', '-', '-', '.', '-', '-', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '.', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '.', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', 'p', '-', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', '.', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '.', '.', '.', '.', '-', '.', '-', '-', '-', '.', '.', '.', '-', '.', '.', '.', '-', '-', '-', '.', '-', '.', '.', '.', '.', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '.', '-', '-', '-', '.', '-', '.', '-', '.', '-', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '-', '.', '-', '.', '-', '.', '-', '-', '-', '.', '-', ' '],
    [' ', '-', '.', '.', '.', '-', '.', '-', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '-', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '.', '-', '.', '.', '.', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '.', '.', '.', '-', '.', '-', ' '],
    [' ', '-', 'p', '.', '.', '-', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', '.', '.', '.', '.', '.', '.', '.', '-', '-', '-', '-', '-', 'p', '.', '.', '.', '.', '-', '.', '.', '.', '-', ' '],
    [' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', ' ', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
]
    //генерация каждого нового квадрата + мы перенесли карту для облегчения кода

//создаём картинку к границам не вызывая её каждый раз, а с помощью ретёрна
// function creatImage(src) {
//     const image = new Image () //вставили картинку !!source = src!!
//     image.src = src
//     return image
// }
let lastKey
let score
function newGame(){
    player.position.x = Boundary.width + Boundary.width * 1.5
    player.position.y = Boundary.height + Boundary.height * 1.5
    player.velocity.x = 0
    player.velocity.y = 0

    ghosts[0].position.x = Boundary.width * 18 + Boundary.width * 2.5,  
    ghosts[0].position.y = Boundary.height + Boundary.height * 1.5
    ghosts[0].velocity.x = Ghost.speed
    ghosts[0].velocity.y = 0

    ghosts[1].position.x = Boundary.width * 18 + Boundary.width * 2.5,
    ghosts[1].position.y = Boundary.height * 19 + Boundary.height * 1.5
    ghosts[1].velocity.x = Ghost.speed
    ghosts[1].velocity.y = 0

    ghosts[2].position.x = Boundary.width * 1 + Boundary.width * 2.5,
    ghosts[2].position.y = Boundary.height * 19 + Boundary.height * 1.5
    ghosts[2].velocity.x = Ghost.speed
    ghosts[2].velocity.y = 0

    ghosts[3].position.x = Boundary.width * 18 + Boundary.width * 2.5,
    ghosts[3].position.y = Boundary.height * 7 + Boundary.height * 1.5
    ghosts[3].velocity.x = Ghost.speed
    ghosts[3].velocity.y = 0


    state = 'ingame'
    lastKey = "" //установили последнюю нажатую кнопку, чтобы ничего не паехалоо, как моя крыша
    score = 0
    scoreEl.innerHTML = score

    map.forEach((row, i) => { //i представляет в какой строке мы находимся в данный момент нашего цикла (индекс)
        row.forEach((symbol, j) => {
            switch (symbol) {
                case '-':
                    boundaries.push(
                        new Boundary({
                            position: {
                                x: Boundary.width * j,
                                y: Boundary.height * i
                            },
                        })
                    )
                    break
                case '.': //создаём еду для пакмана -- массив
                    pellets.push (
                        new Pellet ({
                            position: {
                                x: j * Boundary.width + Boundary.width / 2,
                                y: i * Boundary.height + Boundary.height / 2
                            }
                        })
                    ) 
                    break

                    case 'p': //создаём еду для пакмана -- поверап
                    powerUps.push (
                        new PowerUp ({
                            position: {
                                x: j * Boundary.width + Boundary.width / 2,
                                y: i * Boundary.height + Boundary.height / 2
                            }
                        })
                    ) 
                    break
            }
        })
    })
    
    animate()
}



function circleCollidesWithRectangle ({ circle, rectangle }) { //столкновение круга и квадрата
    const padding = Boundary.width / 2 - circle.radius - 1
    return(
        circle.position.y - circle.radius + circle.velocity.y 
        <= 
        rectangle.position.y + rectangle.height + padding && 
        circle.position.x + circle.radius + circle.velocity.x 
        >= 
        rectangle.position.x - padding && 
        circle.position.y + circle.radius +  circle.velocity.y 
        >= 
        rectangle.position.y - padding && 
        circle.position.x - circle.radius + circle.velocity.x 
        <= 
        rectangle.position.x + rectangle.width + padding
    )
}


//newGame()
//создаём зацикленную анимацию, чтобы пакман двигался
function animate() {

    animationId = requestAnimationFrame(animate) 
    //будет анимировать пкамана пока мы не скажем ему делать движения иначе
    c.clearRect(0, 0, canvas.width, canvas.height) //чтобы не было хвостика за пакманом

    // function close() {
    //     let packmanCanvas = document.getElementById("packmanCanvas");
    //     packmanCanvas.style.display="none";
    //     let bb = document.getElementById("close");
    //     bb.style.display="block"; 
    // }




    // цикл анимации скорости
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) { //i -- итератор; добавляем 1 к i, пока она не станет больше длинны границ
            const boundary = boundaries [i]
            if (
            circleCollidesWithRectangle({
                circle: {
                    ...player, 
                    velocity: {
                        x: 0,
                        y: -Player.speed
                }
                }, //многоточие -- spread
                rectangle: boundary
            })
        ) {
            player.velocity.y = 0
            break
        } else {
            player.velocity.y = -Player.speed
        }
        }

    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) { //i -- итератор; добавляем 1 к i, пока она не станет больше длинны границ
            const boundary = boundaries [i]
            if (
            circleCollidesWithRectangle({
                circle: {
                    ...player, 
                    velocity: {
                        x: -Player.speed, //боковушка
                        y: 0
                }
                }, //многоточие -- spread
                rectangle: boundary
            })
        ) {
            player.velocity.x = 0
            break
        } else {
            player.velocity.x = -Player.speed //идём влево, когда нажимаем клавишу а
        }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) { //i -- итератор; добавляем 1 к i, пока она не станет больше длинны границ
            const boundary = boundaries [i]
            if (
            circleCollidesWithRectangle({
                circle: {
                    ...player, 
                    velocity: {
                        x: 0,
                        y: Player.speed
                }
                }, //многоточие -- spread
                rectangle: boundary
            })
        ) {
            player.velocity.y = 0
            break
        } else {
            player.velocity.y = Player.speed
        }
        }

    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) { //i -- итератор; добавляем 1 к i, пока она не станет больше длинны границ
            const boundary = boundaries [i]
            if (
            circleCollidesWithRectangle({
                circle: {
                    ...player, 
                    velocity: {
                        x: Player.speed,
                        y: 0
                }
                }, //многоточие -- spread
                rectangle: boundary
            })
        ) {
            player.velocity.x = 0
            break
        } else {
            player.velocity.x = Player.speed
        }
        }
    }

    //коллизия между призраком и играком
    for (let i = ghosts.length - 1; 0 <= i; i -- ) {
        const ghost = ghosts [i]
     //призрак докасается до игрока - проигрывем 
    if (
        Math.hypot (
            ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
        )   < 
            ghost.radius + player.radius 
        )   {
            if (ghost.scared){ // если призрак синий, то мы касаемся его и удалем из игры
                ghosts.splice (i, 1)
            }
            else {
                cancelAnimationFrame(animationId)
                console.log ('You lose :(')
                endScreen()
            }
        }
    }

    //
    if (pellets.length === 0) {
        console.log ('you win')
        cancelAnimationFrame(animationId)
    }


    //делаем точечку для буста очков 
    for (let i = powerUps.length - 1; 0 <= i; i -- ) {
        const powerUp = powerUps [i]
        powerUp.draw() 

        //столкновение пакмана с поверапом
        if (
            Math.hypot (
                powerUp.position.x - player.position.x,
                powerUp.position.y - player.position.y
            )   < 
            powerUp.radius + player.radius
        ) {
            powerUps.splice(i, 1)

            //отгоныем приведений
            ghosts.forEach ((ghost) => {
                ghost.scared = true 

                setTimeout(() => {
                    ghost.scared = false
                }, 5000)
            })
        }

    }

    //движение с конца (?) -- зацикливаемся и удалаем с обратной стороны
    for (let i = pellets.length - 1; 0 <= i; i -- ) {
        const pellet = pellets [i]
        pellet.draw()

        //прописываем поедание точечек -- гипотинуза -- самая длинная сторона прям треугольника -- расст между центрома точечки и центром игрока
        if (
            Math.hypot (
                pellet.position.x - player.position.x,
                pellet.position.y - player.position.y
            )   < 
            pellet.radius + player.radius
        )   {
            pellets.splice(i, 1)
            score += 10 //считаем съеденные шарики
            console.log(score)
            scoreEl.innerHTML = score
        }
    } 
    

    boundaries.forEach((boundary) => {
        boundary.draw()

        //распознаём барьеры, перпятствия 
        //пересекается ли одна из границ с нашим игроком?
        //сравниваем сторону грока со сторонами границы 
        //если верхняя часть игрока меньше точки, где проходит нижняя граница кубика - эти две тчк равны
        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
            // player.position.y - player.radius + player.velocity.y 
            // <= 
            // boundary.position.y + boundary.height && 
            // player.position.x + player.radius + player.velocity.x 
            // >= 
            // boundary.position.x && 
            // player.position.y + player.radius +  player.velocity.y 
            // >= 
            // boundary.position.y && 
            // player.position.x - player.radius + player.velocity.x 
            // <= 
            // boundary.position.x + boundary.width
        ) {
            //console.log('we are colliding')
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })
    player.update () //раньше здесь было player.draw (), но за дров теперь отвечает апдейт тк скорость игрока каждый раз увеличивается


    //движение призрака!!!!!!!!!!!!!!!!
    ghosts.forEach ((ghost) => {
        ghost.update()



        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost, 
                        velocity: {
                            x: ghost.speed,
                            y: 0
                    }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push ('right')
            }

            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost, 
                        velocity: {
                            x: -ghost.speed,
                            y: 0
                    }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push ('left')
            }
            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost, 
                        velocity: {
                            x: 0,
                            y: -ghost.speed
                    }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push ('up')
            }

            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost, 
                        velocity: {
                            x: 0,
                            y: ghost.speed
                    }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push ('down')
            }
        })
        if (collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions

        if (JSON.stringify (collisions) !== JSON.stringify (ghost.prevCollisions)) //json.stringify -- строчное значение
        {
            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left') //движ влевоо, если скорость по х меньше нуля
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

            //console.log(collisions)
            //console.log(ghost.prevCollisions)

            const pathways = ghost.prevCollisions.filter((collision //потенциальные пути -- фильтр столкновений 
                ) => {
                return !collisions.includes(collision)
            }) 
            //console.log ({ pathways })

            const direction = pathways [Math.floor (Math.random() * pathways.length)] //рандомный выбор пафвэя (пути, куда идёт призрак); math.floor - целочисленные (те без дробей)

            //console.log ({direction})

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                break
            }
            ghost.prevCollisions = []
        }
        //console.log(collisions)
    })
    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

//animate()

//прослушиватели событий (считываем нажатие кнопки)
//позже установим скорость в цикле анимации (?)
//убрали скорость тк теперь оно само определяем правда ли, что кнопка нажата или нет
addEventListener('keydown', ({key}) => {
    if(key == 'w' || key == 'a' || key == 'd' || key == 's'){ closeStudyscreen() }
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w' //предопределение последней нажатой клавиши, чтобы ничего не поехало
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }

})


//keyup -- чтобы  он не двигался бесконечно по диагонали прописываем скорость на нулях
//убрали скорость как и в кейдаун тк если кнопка не нажата - не проигрываем
addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            //player.velocity.y = 0
            break
        case 'a':
            keys.a.pressed = false
            //player.velocity.x = 0
            break
        case 's':
            keys.s.pressed = false
            //player.velocity.y = 0
            break
        case 'd':
            keys.d.pressed = false
            //player.velocity.x = 0
            break
    }


})

addEventListener('click', mouse => {
    if(state == 'deathscreen'){
        closeDeathscreen()
    }
    else{
        closeStudyscreen()
    }
})

//экран при состоянии проигрышка
function endScreen() {
    state = 'deathscreen'
    /*let packmanCanvas = document.getElementById("packmanCanvas");
    packmanCanvas.style.display="none";*/
    let es = document.getElementById("endScreen");
    es.style.display="flex"; 
    let cl = document.getElementById("close");
    cl.style.display="flex";

    // p1.style.color="black";
}
newGame()
function closeDeathscreen(){
    let packmanCanvas = document.getElementById("packmanCanvas");
    packmanCanvas.style.display="block";
    let es = document.getElementById("endScreen");
    es.style.display="none";
    let cl = document.getElementById("close");
    cl.style.display="none";
    /*let ss = document.getElementById("studyScreen");
    ss.style.display="none";
    let cl2 = document.getElementById("close2");
    cl2.style.display="none";*/

    p1.style.color="white";
    newGame()
}

//экран обучения
function closeStudyscreen(){
    let ss = document.getElementById("studyScreen");
    ss.style.display="none";
    let cl2 = document.getElementById("close2");
    cl2.style.display="none";
}

// window.addEventListener("DOMContentLoaded", event => {
//     const audio = document.querySelector("audio");
//     audio.volume = 0.2;
//     audio.play();
//   });


});