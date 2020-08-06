'use strict'

/** global constants **/
const WINDOW_SCALE_FACTOR = 0.95
const HEIGHT = window.innerHeight * WINDOW_SCALE_FACTOR
const WIDTH = window.innerWidth * WINDOW_SCALE_FACTOR
const TOOLS_WIDTH = WIDTH / 3 /** 1/3 **/
const EDITOR_WIDTH = WIDTH * 2 / 3 /** 2/3 **/

const ELEMENTS =
        {
            planContainer: 'plan-container',
            toolContainer: 'tools-container',
            editorContainer: 'editor-container'
        }


$(document).ready(() => {
    /** create different boxes **/
    createCanvas(ELEMENTS.planContainer, 'plan', TOOLS_WIDTH, HEIGHT / 2)
    createCanvas(ELEMENTS.toolContainer, 'tools', TOOLS_WIDTH, HEIGHT / 2)
    createCanvas(ELEMENTS.editorContainer, 'editor', EDITOR_WIDTH, HEIGHT)

    const plan = new fabric.Canvas('plan', {
        backgroundColor: 'rgb(250,82,201)'
    })

    const tools = new fabric.Canvas('tools', {
        backgroundColor: 'rgb(222,250,205)',
        selection: false
    })

    const editor = new fabric.Canvas('editor', {
        backgroundColor: 'rgb(255,238,205)'
    })

    //todo test
    const text = new fabric.Textbox('Kek', {
        width:250,
        cursorColor :"blue",
        top:10,
        left:10,
        hasBorders: false,
        hasControls: false,
        editable: false,
        selectable: false
    })
    const rect = new fabric.Rect({
        left: 150,
        top: 200,
        width: 150,
        height: 120,
        fill: 'rgba(255,0,0,0.5)',
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
        editable: false,
        selectable: false
    })
    tools.add(text)
    tools.add(rect)
    //todo test

    //todo add img utils
    const backgroundImg = setImgAsBackground(editor, 'dog')
    addCanvasHandlers(editor)

})

function createCanvas(containerId, canvasId, width, height) {
    $(`#${containerId}`).append(`<canvas id="${canvasId}" width="${width}" height="${height}"></canvas>`)
}

function createRect(position) {
    return new fabric.Rect({
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        fill: 'rgba(255,0,0,0.5)', //todo
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
        editable: false,
        selectable: false
    })
}

function setImgAsBackground(fabricCanvas, imgId) {
    const fabricImg = createImg(imgId, {
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
        editable: false,
        selectable: false
    })
    let scaleFactor = 1
    /** scale image if its dimensions is bigger then dimensions of the canvas **/
    if (fabricImg.width > fabricCanvas.width || fabricImg.height > fabricCanvas.height) {
        scaleFactor = Math.min(fabricCanvas.width / fabricImg.width, fabricCanvas.height / fabricImg.height)
        fabricImg.scale(scaleFactor)
    }
    /** set center by height **/
    if (fabricImg.height * scaleFactor < fabricCanvas.height) {
        fabricImg.top = (fabricCanvas.height - fabricImg.height * scaleFactor) / 2
    }
    /** set center by width **/
    if (fabricImg.width * scaleFactor < fabricCanvas.width) {
        fabricImg.left = (fabricCanvas.width - fabricImg.width * scaleFactor) / 2
    }
    fabricCanvas.add(fabricImg)
    return fabricImg
}

/** create fabric image from <img ... /> **/
function createImg(imgId, opt = {}) {
    const imgElement = document.getElementById(imgId)
    return new fabric.Image(imgElement, opt)
}

/** add handlers to canvas **/
function addCanvasHandlers(fabricCanvas) {
    /** zoom **/
    fabricCanvas.on('mouse:wheel', opt => {
        const delta = opt.e.deltaY
        let zoom = fabricCanvas.getZoom()
        zoom *= 0.999 ** delta
        /** restrict zoom **/
        if (zoom > 10) zoom = 10
        if (zoom < 0.1) zoom = 0.1
        fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
    })
}