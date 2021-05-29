import { Draw } from './drawTools.js'

const canvasLayer1 = document.querySelector("#layer1")
const canvasLayer2 = document.querySelector("#layer2")
const ctx2 = canvasLayer2.getContext('2d')
const ctx = canvasLayer1.getContext('2d')
const images = document.querySelectorAll(".images")
let imageSelected = null
let edit = false

export function controlImage(key){
    imageSelected = images[key]
}

export function setEditMode(){
    let editButton = document.querySelector('.edit-button')

    editButton.style.backgroundColor = edit ? 'red' : 'green'
    edit = edit ? false : true
}
setEditMode()

// Time of program
let time = 0
let circles = {}
let points = []  

let showPoints = true
let mouseAxies = [0, 0]

const draw = new Draw()



function getMousePosition(evt){
    let rect = canvasLayer2.getBoundingClientRect()
    return {
        x: ((evt.clientX - rect.left - 10) / 550 * 1000 - 500) / 100,
        y: (500 - (evt.clientY - rect.top -10) / 550 * 1000) / 100,
    }
}
function addCircle(control = [1, 0], velocity = 1){

    // Random name
    let randomId = Math.floor(Math.random() * 99999)

    circles[randomId] = {
        control,
        velocity
    }
}

export function setCircles(circlesLength){
    // time's variation
    const dt = 1 / points.length
    for(
        let velocity = Math.floor(-circlesLength / 2); 
        velocity <= Math.ceil(circlesLength); 
        velocity++
    ){
        let coefficient = [0, 0]
        let input = 0

        for(const pointId in points){
            // Output of function: [a, bi]
            const output = points[pointId]

            // e^{in} = cos(n) + i*sin(n)
            let term = [
                Math.cos(-2 * Math.PI * input * velocity),
                Math.sin(-2 * Math.PI * input * velocity),
            ]

            // Compute Integral
            coefficient[0] += (output[0] * term[0] - output[1] * term[1]) * dt
            coefficient[1] += (output[0] * term[1] + output[1] * term[0]) * dt

            // Add time's variation
            input += dt
        }

        addCircle(coefficient, velocity)
    }
}
    
function render(){
    draw.background()
    if(imageSelected == null){
        draw.background()
    }else{
        ctx.save()
        ctx.globalAlpha = 0.3;
        ctx.drawImage(imageSelected, 0, 0) 
        ctx.restore()
    }

    /*
    Center of circles - [a, bi]
    Complex function - time -> [a, bi]
    */

    let center = [0, 0]
    let complexOutput = [0, 0]

    // Sum of each circle
    for(const circleId in circles){

        const circle = circles[circleId]

        // Before modification
        center[0] = complexOutput[0]
        center[1] = complexOutput[1]

        // Initial Circle - time -> [a, bi]
        let initialCircle = [
            Math.cos(2 * Math.PI * time * circle.velocity),
            Math.sin(2 * Math.PI * time * circle.velocity) 
        ]
        
        // Sum of circle
        complexOutput[0] += circle.control[0] * initialCircle[0] - circle.control[1] * initialCircle[1]
        complexOutput[1] += circle.control[0] * initialCircle[1] + circle.control[1] * initialCircle[0]
        
        // Draw circle/vector
        draw.circle(
            center[0], 
            center[1], 
            Math.sqrt(Math.pow(circle.control[0], 2) + Math.pow(circle.control[1], 2))
        )
        draw.vector(
            center[0], 
            center[1], 
            complexOutput[0], 
            complexOutput[1]
        )
    }

    // Draw output of function
    draw.point(
        complexOutput[0], 
        complexOutput[1]
    )
    
    if(showPoints){
        for(let pointId in points){
            const point = points[pointId]
            draw.circle(point[0], point[1], 0.05, "rgba(0, 255, 0, 0.3)")
        }
    }

    if(edit && points.length != 0){
        draw.vector(
            points[points.length - 1][0], 
            points[points.length - 1][1],
            mouseAxies[0], 
            mouseAxies[1],
            "rgba(0, 255, 0, 0.3)"
        )
    }
    
    // Add 1 milisecound
    time += 1 / 1000
}

setInterval(render, 1)

canvasLayer2.addEventListener('click', evt => {
   
    if(edit && points.length != 0){

        let initPoints = []
        let collecs = []

        for(let k = 0; k < 2; k++){
            initPoints.push(points[points.length - 1][k])
            collecs.push(mouseAxies[k] - initPoints[k])
        }

        let hip = (collecs[0]**2 + collecs[1]**2)**0.5
        let numberOfPoints = hip * 8

        for(let i = 0; i < numberOfPoints - 1; i++){
            initPoints[0] += collecs[0] / numberOfPoints
            initPoints[1] += collecs[1] / numberOfPoints
            points.push([initPoints[0], initPoints[1]])
        }

    }else if(edit){
        points.push([mouseAxies[0], mouseAxies[1]])
    }
})

canvasLayer2.addEventListener('mousemove', evt => {
    let mousePosition = getMousePosition(evt)

    mouseAxies[0] = mousePosition.x
    mouseAxies[1] = mousePosition.y
})