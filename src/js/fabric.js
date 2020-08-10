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
            imageContainer: 'img-container',
            editorContainer: 'editor-container',
            plan: 'plan',
            tools: 'tools',
            editor: 'editor',
            deleteBtn: 'delete',
            createTextBtn: 'create-text',
            resetZoomBtn: 'reset-zoom',
            createRectBtn: 'create-rect',
            createCircleBtn: 'create-circle',
            createLineBtn: 'create-line'
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
    addEditorHandlers(editor, editorContainer)

    const imageContainer = document.getElementById(ELEMENTS.imageContainer)

    //todo server images
    availableImages.forEach(imageSrc => {
        addToolImage(imageContainer, imageSrc)
    })

    /** set toolbar handlers **/
    addToolbarHandlers(
        $(`#${ELEMENTS.deleteBtn}`),
        $(`#${ELEMENTS.createTextBtn}`),
        $(`#${ELEMENTS.resetZoomBtn}`),
        $(`#${ELEMENTS.createRectBtn}`),
        $(`#${ELEMENTS.createCircleBtn}`),
        $(`#${ELEMENTS.createLineBtn}`),
        editor
    )

})

//todo auto setting dimensions
function createCanvas(containerId, canvasId, width, height) {
    $(`#${containerId}`).append(`<canvas id="${canvasId}" width="${width}" height="${height}"></canvas>`)
}

/** set image as no-editable object **/
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
    fabricCanvas.setBackgroundImage(fabricImg, fabricCanvas.renderAll.bind(fabricCanvas))
    return fabricImg
}

/** create fabric image from <img ... /> **/
function createImgFromId(imgId, opt = {}) {
    const imgElement = document.getElementById(imgId)
    return new fabric.Image(imgElement, opt)
}

/** create fabric image from HTML element **/
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
function addEditorHandlers(fabricCanvas, canvasContainer) {
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
    /** mouse move handler **/
    fabricCanvas.on('mouse:move', e => {
        if (fabricCanvas.isCreateNow && fabricCanvas.currentCreatingObject) {
            const pointer = fabricCanvas.getPointer(e, false)
            let width = pointer.x - fabricCanvas.currentCreatingObject.left
            let height = pointer.y - fabricCanvas.currentCreatingObject.top
            /** rect changer **/
            if (fabricCanvas.currentCreatingObject instanceof fabric.Rect) {
                if (width < 0) width = 0
                if (height < 0) height = 0
                fabricCanvas.currentCreatingObject.set('width', width)
                fabricCanvas.currentCreatingObject.set('height', height)
            /** circle changer **/
            }
            else if (fabricCanvas.currentCreatingObject instanceof fabric.Circle) {
                fabricCanvas.currentCreatingObject.set('radius', Math.abs(width/2))
            }
            /** line changer **/
            else if (fabricCanvas.currentCreatingObject instanceof fabric.Line) {
                fabricCanvas.currentCreatingObject.set({
                    x2: pointer.x,
                    y2: pointer.y
                })
                fabricCanvas.currentCreatingObject.setCoords()
            }
            fabricCanvas.renderAll()
        }
    })
    /** mouse down handler **/
    canvasContainer.onmousedown = e => {
        /** if current object is fabric.Textbox render it immediately**/
        if (fabricCanvas.currentCreatingObject instanceof fabric.Textbox) {
            const pointer = fabricCanvas.getPointer(e, false)
            fabricCanvas.currentCreatingObject.left = pointer.x - fabricCanvas.currentCreatingObject.width
            fabricCanvas.currentCreatingObject.top = pointer.y - fabricCanvas.currentCreatingObject.height
        }
        /** start drawing **/
        else if (fabricCanvas.currentCreatingObject && !fabricCanvas.isCreateNow) {
            fabricCanvas.forEachObject(object => {
                object.lockMovementX = true
                object.lockMovementY = true
            })
            fabricCanvas.discardActiveObject(e)
            fabricCanvas.selection = false
            fabricCanvas.isCreateNow = true
            const pointer = fabricCanvas.getPointer(e, false)
            fabricCanvas.currentCreatingObject.left = pointer.x
            fabricCanvas.currentCreatingObject.top = pointer.y
            /** set line coords **/
            if (fabricCanvas.currentCreatingObject instanceof fabric.Line) {
                fabricCanvas.currentCreatingObject.set({
                    x1: pointer.x,
                    y1: pointer.y
                })
                fabricCanvas.currentCreatingObject.left = pointer.x
                fabricCanvas.currentCreatingObject.top = pointer.y
                fabricCanvas.currentCreatingObject.setCoords()
            }
            fabricCanvas.add(fabricCanvas.currentCreatingObject)
        }
    }
    /** stop drawing **/
    canvasContainer.onmouseup = e => {
        if (fabricCanvas.isCreateNow || (fabricCanvas.currentCreatingObject instanceof fabric.Textbox)) {
            fabricCanvas.forEachObject(object => {
                object.lockMovementX = false
                object.lockMovementY = false
            })
            fabricCanvas.setActiveObject(fabricCanvas.currentCreatingObject)
            fabricCanvas.selection = true
            fabricCanvas.remove(fabricCanvas.currentCreatingObject)
            fabricCanvas.add(fabricCanvas.currentCreatingObject)
            fabricCanvas.currentCreatingObject = null
            fabricCanvas.isCreateNow = false
            fabricCanvas.renderAll()
            $('.active').removeClass('active')
        }
    }
    /** drop handler **/
    canvasContainer.ondrop = e => {
        if (e.preventDefault)
            e.preventDefault()
        if (e.stopPropagation)
            e.stopPropagation()

        const pointer = fabricCanvas.getPointer(e, false)
        const img = document.querySelector('img.img-dragging')
        const fabricImg = createImgFromElem(img, pointer.x - img.customOffsetX, pointer.y - img.customOffsetY)
        fabricCanvas.add(fabricImg)
    }
    /** drag over handler **/
    canvasContainer.ondragover = e => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        e.dataTransfer.dropEffect = 'copy'
    }
}

/** add tool image to toolbox **/
function addToolImage(container, imageSrc) {
    const div = document.createElement('div')
    div.height = 80
    div.width = 80
    div.classList.add('tool-img-div')
    const img = document.createElement('img')
    img.draggable = true
    img.src = imageSrc
    img.classList.add('tool-img')
    /** calc scale **/
    const scaleFactor = Math.min(80 / img.naturalWidth, 80 / img.naturalHeight)
    img.height = img.naturalHeight * scaleFactor
    img.width = img.naturalWidth * scaleFactor
    /** drag start handler **/
    img.ondragstart = e => {
        img.classList.add('img-dragging')
        img.customOffsetX = e.clientX - img.offsetLeft
        img.customOffsetY = e.clientY - img.offsetTop
    }
    /** drag end handler **/
    img.ondragend = () => {
        img.classList.remove('img-dragging')
    }
    /** add image to toolbox **/
    div.append(img)
    container.append(div)
}

/** add toolbar handlers **/
function addToolbarHandlers(
    deleteBtn,
    createTextBtn,
    resetZoomBtn,
    createRectBtn,
    createCircleBtn,
    createLineBtn,
    fabricCanvas
    ) {
    /** delete button handler **/
    deleteBtn.click(e => {
        const activeObjects = fabricCanvas.getActiveObjects()
        activeObjects.forEach(object => {
            fabricCanvas.remove(object)
        })
        fabricCanvas.discardActiveObject(e)
    })
    /** reset zoom button handler **/
    resetZoomBtn.click(() => {
        fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    })
    /** add text button handler **/
    createTextBtn.click(() => {
        $('.active').removeClass('active')
        createTextBtn.addClass('active')
        fabricCanvas.currentCreatingObject = createTextBox()
    })
    /** create circle **/
    createCircleBtn.click(() => {
        $('.active').removeClass('active')
        createCircleBtn.addClass('active')
        fabricCanvas.currentCreatingObject = createCircle()
    })
    /** create rect **/
    createRectBtn.click(() => {
        $('.active').removeClass('active')
        createRectBtn.addClass('active')
        fabricCanvas.currentCreatingObject = createRect()
    })
    /** create line **/
    createLineBtn.click(() => {
        $('.active').removeClass('active')
        createLineBtn.addClass('active')
        fabricCanvas.currentCreatingObject = createLine()
    })
}

/** create fabric rect **/
function createRect() {
    return new fabric.Rect({
        strokeWidth: 2,
        stroke: 'black',
        fill:'transparent',
        transparentCorners: true,
        hasBorders: true,
        hasControls: true,
        editable: true,
        selectable: true
    })
}
/** create editable textbox **/
function createTextBox() {
    return new fabric.Textbox('текст')
}

/** create fabric circle **/
function createCircle() {
    return new fabric.Circle({
        strokeWidth: 2,
        stroke: 'black',
        fill:'transparent',
        transparentCorners: true,
        hasBorders: true,
        hasControls: true,
        editable: true,
        selectable: true,
    })
}

/** create fabric line **/
function createLine() {
    return new fabric.Line([], {
        strokeWidth: 2,
        stroke: '#000000'
    })
}