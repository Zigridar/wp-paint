'use strict'
/** Matter.js modules **/
const Engine = Matter.Engine
const Render = Matter.Render
const World = Matter.World
const Bodies = Matter.Bodies
const Body = Matter.Body
const Constraint = Matter.Constraint
const Svg = Matter.Svg
const Mouse = Matter.Mouse
const MouseConstraint = Matter.MouseConstraint

/** Global variables **/
const width = 1300
const height = 500
const wallWidth = 20

/** Global containers **/
const pathArr = []
let circleArr = []
let rectangleArr = []
const walls = []
let dickArr = []
let shitArr = []
let iepArr = []

/** create wall **/
function createWall(x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {isStatic: true})
}

/** add items to world **/
function addToWorld(items) {
    World.add(engine.world, items)
}

function removeFromWorld(items) {
    World.remove(engine.world, items)
}

/** walls **/
walls.push(createWall(width/2, wallWidth/2, width, wallWidth))
walls.push(createWall(width/2, height - wallWidth/2, width, wallWidth))
walls.push(createWall(wallWidth/2, height/2, wallWidth, height))
walls.push(createWall(width - wallWidth/2, height/2, wallWidth, height))

/** init SVG bodies **/
//todo
// $('svg').find('path').each(function(i, path){
//     const newPath = Svg.pathToVertices(path);
//     pathArr.push(newPath);
// });

function createIEP() {
    return Bodies.rectangle(50 + (width - 50)*(1 - Math.random()), 50, 100, 100, {
            isStatic: false,
            render: {
                sprite: {
                    texture: './L.jpeg',
                    xScale: 0.3,
                    yScale: 0.3
                }
            }
        }
    )
}

function createShit() {
    return Bodies.rectangle(20 + (width - 20)*(1 - Math.random()), 50, 50, 100, {
        isStatic: false,
        render: {
            sprite: {
                texture: './shit.png',
                xScale: 0.3,
                yScale: 0.3
            }
        }
    })
}


const engine = Engine.create()

const render = Render.create({
    element: document.getElementById("matter"),
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false
    }
})

// const bodyA = Bodies.rectangle(1000, 600, 80, 20)
// const bodyB = Bodies.rectangle(50, 300, 80, 20)
//
// const options = {
//     bodyA: bodyA,
//     bodyB: bodyB,
//     length: 50,
//     stiffness: 0.1
// }
//
// const constraint = Constraint.create(options)
const d = document.getElementsByTagName('canvas')
const mouse = Mouse.create(d[0])

const mcOptions = {
    mouse: mouse
}
const mConstraint = MouseConstraint.create(engine, mcOptions)

addToWorld(mConstraint)

addToWorld(walls)

/** run application **/
Engine.run(engine)
Render.run(render)

/** buttons **/ //todo buttons.js
function addCircle() {
    const circle =  Bodies.circle(20 + (width - 20)*(1 - Math.random()), 50, Math.random()*40)
    circleArr.push(circle)
    return circle
}

function addRectangle() {
    const rectangle = Bodies.rectangle(20 + (width - 20)*(1 - Math.random()), 50, 50 - Math.random()*15, 50 - Math.random()*15)
    rectangleArr.push(rectangle)
    return rectangle
}


$('#addCircle').click(()=> {
    World.add(engine.world, addCircle())
})

$('#addRectangle').click(()=> {
    World.add(engine.world, addRectangle())
})

for (let i = 0; i < 10; i++) {
    addToWorld(addRectangle())
    addToWorld(addCircle())
}

// /** kick button **/
// $('#kickDick').click(() => {
//     dickArr.forEach(item => {
//         Body.setVelocity(item, {x: 10 - Math.random()*20, y: -15 + Math.random()*7})
//     })
// })

// /** add dick **/
// $('#addDick').click(() => {
//     const newBody = Bodies.fromVertices(20 + (width - 20)*(1 - Math.random()), 50, pathArr[0])
//     Body.scale(newBody, 0.2, 0.2)
//     dickArr.push(newBody)
//     addToWorld(newBody)
// })

// /** remove dick **/
// $('#removeDick').click(() => {
//     const dick = dickArr.pop()
//     if (dick)
//         removeFromWorld(dick)
// })

// /** remove all dicks **/
// $('#removeAllDick').click(() => {
//     removeFromWorld(dickArr)
//     removeFromWorld(circleArr)
//     removeFromWorld(rectangleArr)
//     removeFromWorld(shitArr)
//     shitArr = []
//     dickArr = []
//     rectangleArr = []
//     circleArr = []
// })

// /** rotate button **/
// $('#rotF').click(() => {
//     iepArr.forEach(iep => {
//         Body.setAngularVelocity(iep, Math.PI/9)
//     })
// })

// $('#rotB').click(() => {
//     iepArr.forEach(iep => {
//         Body.setAngularVelocity(iep, -Math.PI/9)
//     })
// })



// /** stress test **/
// let interval = null
// $('#stress').click(() => {
//     interval = setInterval(() => {
//         addToWorld(addCircle())
//         addToWorld(addRectangle())
//     }, 100)
//     $('#stress').toggleClass('disabled')
//     $('#stopStress').toggleClass('disabled')
// })
//
// $('#stopStress').click(() => {
//     clearInterval(interval)
//     $('#stress').toggleClass('disabled')
//     $('#stopStress').toggleClass('disabled')
// })

// $('#water').click(() => {
//     const newIEP = createIEP()
//     iepArr.push(newIEP)
//     addToWorld(newIEP)
// })

// $('#plasma').click(() => {
//     circleArr = []
//     rectangleArr = []
//     dickArr = []
//     World.clear(engine.world, true)
//     addToWorld(mConstraint)
// })

// $('#diplom').click(() => {
//     const newShit = createShit()
//     console.log(newShit)
//     addToWorld(newShit)
//     shitArr.push(newShit)
// })

// $('#link').click(() => {
//     window.open('https://lurkmore.to/')
// })
