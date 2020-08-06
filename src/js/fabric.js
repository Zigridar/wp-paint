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
            toolContainer: 'tool-container',
            editorContainer: 'editor-container',
            plan: 'plan',
            tools: 'tools',
            editor: 'editor'
        }

//todo get names from server and load using GET method
const availableImages = ['bike.png', 'forest.png', 'stick.png']

/** freeze const object **/
Object.freeze(ELEMENTS)


$(document).ready(() => {
    /** create different boxes **/
    createCanvas(ELEMENTS.planContainer, ELEMENTS.plan, TOOLS_WIDTH, HEIGHT / 2)
    createCanvas(ELEMENTS.editorContainer, ELEMENTS.editor, EDITOR_WIDTH, HEIGHT)

    /** init draggable toolbox **/
    const toolsContainer =  $(`#${ELEMENTS.toolContainer}`)
    toolsContainer.css('height', HEIGHT / 2)
    toolsContainer.css('max-width', TOOLS_WIDTH)

    const plan = new fabric.Canvas('plan', {
        backgroundColor: 'rgb(198,197,250)'
    })

    const editor = new fabric.Canvas('editor', {
        backgroundColor: 'rgb(255,238,205)'
    })

    //todo add img utils
    const backgroundImg = setImgAsBackground(editor, 'map')
    const editorContainer = document.getElementById(ELEMENTS.editorContainer)
    /** add canvas handlers **/
    addCanvasHandlers(editor, editorContainer)

    const imageContainer = document.getElementById(ELEMENTS.toolContainer)

    //todo server images
    availableImages.forEach(imageSrc => {
        addToolImage(imageContainer, imageSrc)
    })

})

function createCanvas(containerId, canvasId, width, height) {
    $(`#${containerId}`).append(`<canvas id="${canvasId}" width="${width}" height="${height}"></canvas>`)
}

function setImgAsBackground(fabricCanvas, imgId) {
    const fabricImg = createImgFromId(imgId, {
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
function createImgFromId(imgId, opt = {}) {
    const imgElement = document.getElementById(imgId)
    return new fabric.Image(imgElement, opt)
}

/** create fabric image from HTML elemet **/
function createImgFromElem(elem, x, y) {
    const  fabricImg = new fabric.Image(elem, {
        left: x,
        top: y
    })
    const scaleFactor = Math.min(elem.width / elem.naturalWidth, elem.height / elem.naturalHeight)
    fabricImg.scale(scaleFactor)
    return fabricImg
}

/** add handlers to canvas **/
function addCanvasHandlers(fabricCanvas, canvasContainer) {
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

    canvasContainer.ondrop = e => {
        if (e.preventDefault)
            e.preventDefault()
        if (e.stopPropagation)
            e.stopPropagation()

        const pointer = fabricCanvas.getPointer(e, false)
        const img = document.querySelector('img.img-dragging')
        console.log(pointer.x - img.customOffsetX, pointer.y - img.customOffsetY)
        const fabricImg = createImgFromElem(img, pointer.x - img.customOffsetX, pointer.y - img.customOffsetY)
        fabricCanvas.add(fabricImg)
    }

    canvasContainer.ondragover = e => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        e.dataTransfer.dropEffect = 'copy'
    }
}

/** add tool image to toolbox **/
function addToolImage(container, imageSrc) {
    const img = document.createElement('img')
    img.draggable = true
    img.src = imageSrc
    img.width = 60
    img.height = 60
    img.classList.add('tool-img')
    img.ondragstart = e => {
        img.classList.add('img-dragging')
        img.customOffsetX = e.clientX - img.offsetLeft
        img.customOffsetY = e.clientY - img.offsetTop
    }
    img.ondragend = e => {
        img.classList.remove('img-dragging')
    }
    container.append(img)
}