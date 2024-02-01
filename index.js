const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
console.log(c) 

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary{
    constructor ({position}){
        this.position = this.position
        this.width = 40
        this.height = 40 //делаем границу
    }

    draw(){
        c.fillStyle = 'blue' //цвет границы
        c.fillRect(this.position.x, this.position.y, 
        this.position.width, this.position.height) //позиция и заливание цветом квадрата-границы
    }
}

const boundary = new Boundary ({
    position: {
        x: 0,
        y: 0 //позиция квадрата-границы
    }
})

boundary.draw()
