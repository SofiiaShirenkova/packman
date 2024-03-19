document.addEventListener("DOMContentLoaded", function() {


const scoreEl = document.querySelector('#scoreEl')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth 
canvas.height = innerHeight 

let state = 'study'

let animationId

//создаём игрока 
class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.opacity = 1

        const image = new Image()
        image.src = './img/spaceship.svg'
        image.onload =  () => { //при загрузке установи эти параметры
            const scale = 0.3
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
    
        }
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    update() {
        if (this.image) {//вызываем с.дравимадж, если картинка вообще существует
        this.draw()
        this.position.x += this.velocity.x //добавляем скорость х к позиции х игрока при кажд обновлении 
        }
    }
}


class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/invader.svg'
        image.onload =  () => { 
            const scale = 0.5
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }
       
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update({velocity}) {
        if (this.image) {
        this.draw()
        this.position.x += velocity.x // не this.velocity тк передаём точку чеоез обновление
        this.position.y += velocity.y 
        }
    }

    //захватчики стреляют
    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2, 
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

//создание сетки захватчиков (хотя могли бы сделать массив но ладно)
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 4,
            y: 0
        }

        this.invaders = [] //отображаем захватчиков -- создавая сетку - создаём нового захватчика

        const column = Math.floor(Math.random() * 8 + 5) 
        const rows = Math.floor(Math.random() * 5 + 2) //отображаем рандомное кол-во строк до 6, но никогда не меньше 2

        this.width = column * 63

        for(let x = 0; x < column; x++) {
            for(let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({position: {
                    x: x * 65,
                    y: y * 65
                }})) //итератор равен нулю, 10 колон, итерация 1 для каждого цикла фор
            }
        }
    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        }
    }
}

//создаём пульки
class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 3.2
    }

    //РИСУЕМ КРУГЛУЮ ПУЛЬКУ
    draw() {
        c.beginPath() //НАЧАЛИ ДУГУ
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)  //обвели точку дугой -- создание круга
        c.fillStyle = 'red'
        c.fill()
        c.closePath() //ЗАКОНЧИЛИ ДУГУ 
    }

    update() {
        this.draw() // отображаем пульку
        this.position.x += this.velocity.x //добавляем скорость пулек
        this.position.y += this.velocity.y
    }
}

//создаём частицы, разлетающиеся при удалении
class Particle {
    constructor({position, velocity, radius, color, fades}) {
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color 
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity //исчезновение частиц
        c.beginPath() 
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)  
        c.fillStyle = this.color
        c.fill()
        c.closePath() 
        c.restore()
    }

    update() {
        this.draw() 
        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y

        if (this.fades) this.opacity -= 0.01
    }
}

//пульки захватчиков
class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10
    }

    draw() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
        this.draw() 
        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y
    }
}

const player = new Player()
const projectiles = []
const grids = [] //создаём массив из нескольких сеток
const invaderProjectiles = []
const particles = []

const keys = { //отследивание клавиш -- нажата? проигрывам! не нажата? стопаемся!
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 1100) //создание второго грида с захватчиками
let game = {
    over: false,
    active: true
}
let score = 0

//звёзды на бэкграунде
for(let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position:{ //рандомное расположение звёзд на фоне по оси х и y
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        }, 
        velocity: {
            x: 0,
            y: 0.2 //опускаются по оси х -- скорость
        },
        radius: Math.random() * 2,
        color:'white'
}))}

function createParticles({object, color, fades})  {
    //ЧАСТИЦЫ РАЗЛЕТАЮТСЯ ПРИ УДАРЕ корабля с ПУЛЬКОЙ
    for(let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position:{
                x: object.position.x + object.width / 2, //середина по оси х и у
                y: object.position.y + object.width / 2
            }, 
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#00FF00',
            fades
    }))}
}

function animate () {
    if (!game.active) return //если игра не активна -- весь последующий код не активируется
    requestAnimationFrame(animate)
    c.fillStyle = 'black' 
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach((particle, i) => {

            //зациклили появление звёзд на бэке -- появление на осях
            if (particle.y - particle.radius >= canvas.height) {
                particle.position.x = Math.random() * canvas.width
                particle.position.y = -particle.radius
            }

        if(particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0) 
            } else {
                particle.update()
            }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)    
            }, 0)
        } else invaderProjectile.update()

        
        //код обнаружения столкновения пульки и корабля
        if(
            invaderProjectile.position.y + invaderProjectile.height 
            >= 
            player.position.y && 
            invaderProjectile.position.x + invaderProjectile.width 
            >= 
            player.position.x &&
            invaderProjectile.position.x <= player.position.x +
            player.width
        ) { 
            console.log('you lose')

            setTimeout(() => { //при попадании в игрока снаряд исчезает
                invaderProjectiles.splice(index, 1)    
                player.opacity = 0
                game.over = true
            }, 0)

            setTimeout(() => { 
                game.active = false
            }, 2000) //игра анимируется в теч 2 сек после проигрыша

            createParticles({
                object: player,
                color: '#00FF00',
                fades: true
            })
        }
    })



    projectiles.forEach ((projectile, index) => {

        if (projectile.position.y + projectile.radius <= 0){ //нижняя ачсть снаряда < или = 0 -- находится за пределами верхней части экрана
            setTimeout(() => {
                projectiles.splice(index, 1)    
            }, 0) //нам нужен один доп кадр -- предотвращ имигание на экране -- избавились от двойных пулек
        } else {
            projectile.update() //вызываем снаряд и апдейтим его
        }
    })

    grids.forEach((grid, gridIndex) => { //все захватчики в сетке
        grid.update()
        
        //создаём спульки
        if (frames % 100 === 0 && grid.invaders.length > 0) {//пускаем пульку на каждый сотый кадр и если в текущей сетке есть захватчики, то переходим к след шагу
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles) //выбрали случайного захватчика, который будет стрелять
        }

        grid.invaders.forEach((invader, i) => { //отображаем захватчика на экране при обновлении
            invader.update({velocity: grid.velocity})

            //пульки удаляют захватчика
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= 
                    invader.position.y + invader.height && 
                projectile.position.x + projectile.radius >= 
                    invader.position.x && 
                projectile.position.x - projectile.radius <= 
                    invader.position.x + invader.width && 
                projectile.position.y + projectile.radius >= 
                    invader.position.y) {//удаляем захватчика если верхняя часть снаряда меньше нижней части одного из захватчиков

                    setTimeout(() => { //стреляем и удаляем захватчиков
                        const invaderFound = grid.invaders.find( //просматриваем нашли ли мы захватчика, если он равен захватчику2
                            (invader2) => invader2 === invader 
                        ) 

                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 ===  projectile
                        )

                        //убираем захватчика и пульку
                        if (invaderFound && projectileFound) {
                            score += 100
                            scoreEl.innerHTML = score

                            createParticles({
                                object: invader,
                                fades: true
                            })

                        
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            //чтобы новая сетка правильно отталкивалась отлевого края
                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length -1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x 
                            }else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)
            
        }})
        })
    })

    const vel = 8 //установили константу для скорости корабля

    if (keys.a.pressed && player.position.x >= 0) { //нажимая клавишу а двиг влево, а перемещ лев сторону игрока если она > или = нулю -- создали границу слева 
        player.velocity.x = -vel //перемещение влево
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) { //тут не if else, а else if (что странно, надо разобраться почему!!!) + && далее установка границ справа 
        player.velocity.x = vel
    } else {
        player.velocity.x = 0
    }

    //создаём ещё одну сетку с захватчиками -- функция интервала для появления врагов 
    if (frames % randomInterval === 0) { //достигая тысячи появляется ещё одна сетка врагов -- теперь делаем на рандом -- если получили 0 - то будет минимум 500 -- переменная randomInterval
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 400)
        frames = 0
    }

    frames++ //значик, что мы прошли один цикл нашей анимации (добавили + 1 кадр)
}

animate()

//({}) -- деструктурирование объекта
addEventListener('keydown', ({ key }) => {
    // if(key == 'a' || key == 'd' || key == ' '){ closeStudyscreen() }
    if (game.over) return //при проигрыше -- кораблик больше не стреляет

    switch (key) {
        case 'a':
            //console.log('left')
            keys.a.pressed = true //кнопка нажата? - да! -- проигрываем! нет? -- стопаемся!
        break
        case 'd':
            //console.log('right')
            keys.d.pressed = true
        break
        case ' ': //при нажатии пробела пулька летит вверх
            //console.log('space')
            projectiles.push(new Projectile({ //ПУЛЬКИ ПОЗИШН + СКОРОСТЬ
        position: {
            x: player.position.x + player.width / 2, //пульки летят левее тк оттуда начинается пллоскость координат
            y: player.position.y
        },
        velocity:{
            x: 0,
            y: -8
        }
        }))
        break
    }
})

//остановка при достижении нужной скорости
addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
           // console.log('left')
            keys.a.pressed = false
        break
        case 'd':
            //console.log('right')
            keys.d.pressed = false
        break
        case ' ':
            //console.log('space')
        break
    }
})

addEventListener('click', mouse => {
    if(state == 'deathscreen'){
        closeDeathscreen()
    }
    else{
        console.log("kjfwijefiwoe")
        closeStudyScreenSpace()
    }
})

//экран при состоянии проигрышка
function endScreenSpace() {
    state = 'deathscreen'
    let ess = document.getElementById("endScreenSpace");
    ess.style.display="flex"; 
    let cl = document.getElementById("close");
    cl.style.display="flex";
}

newGame()
function closeDeathscreen(){
    let spaceCanvas = document.getElementById("spaceCanvas");
    spaceCanvas.style.display="block";
    let ess = document.getElementById("endScreenSpace");
    ess.style.display="none";
    let cl = document.getElementById("close");
    cl.style.display="none";
    
    p2.style.color="white";
    newGame()
}

//экран обучения
function closeStudyScreenSpace(){
    let sss = document.getElementById("studyScreenSpace");
    sss.style.display="none";
    let cl3 = document.getElementById("close3");
    //cl3.style.display="none";
}

});

