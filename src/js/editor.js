'use strict'

/** global constants **/
const WINDOW_SCALE_FACTOR = 0.99

/** global editor link **/
let editor = null

const ELEMENTS =
        {
            leftContainer: 'left-container',
            parent: 'parent',
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

/** freeze const object **/
Object.freeze(ELEMENTS)

/** initial function **/
const initialFunction = () => {

    const parent = $(`#${ELEMENTS.editorContainer}`).parent()
    const HEIGHT = parent.height() * WINDOW_SCALE_FACTOR
    const WIDTH = parent.width() * WINDOW_SCALE_FACTOR

    /** init draggable toolbox **/
    const $toolsContainer = $(`#${ELEMENTS.toolContainer}`)
    const $leftContainer = $(`#${ELEMENTS.leftContainer}`)
    const $editorContainer = $(`#${ELEMENTS.editorContainer}`)

    //todo gen plan
    const plan = new fabric.Canvas(ELEMENTS.plan, {
        backgroundColor: 'rgb(198,197,250)'
    })

    editor = new fabric.Canvas(ELEMENTS.editor, {
        backgroundColor: 'rgb(255,255,255)'
    })

    /** set plan dimensions **/
    plan.setWidth(WIDTH * 0.3)
    plan.setHeight(HEIGHT * 0.5)

    /** set editor dimensions **/
    editor.setWidth(WIDTH * 0.7)
    //todo
    editor.setHeight(HEIGHT)

    $leftContainer.css('width', WIDTH * 0.3)
    $leftContainer.css('height', HEIGHT)

    $toolsContainer.css('width', WIDTH * 0.3)
    $toolsContainer.css('height', HEIGHT * 0.5)

    $editorContainer.css('width', WIDTH * 0.7)
    $editorContainer.css('height', HEIGHT)

    const editorContainer = document.getElementById(ELEMENTS.editorContainer)
    /** add canvas handlers **/
    addEditorHandlers(editor, editorContainer)

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

    /** init editor tool handlers **/
    initEditor()
}

/** set image as not-editable object **/
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
    canvasContainer.onmouseup = () => {
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
        createImageFromEditor()
    }
    /** drag over handler **/
    canvasContainer.ondragover = e => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        e.dataTransfer.dropEffect = 'copy'
    }
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

/** init editor **/
function initEditor() {
    //todo
    /** drop default onDragStart listener **/
    document.ondragstart = undefined
    /**  add drag & drop listeners **/
    $('.tool-img').each((index, item) => {
        item.draggable = true
        item.ondragstart = e => {
            item.classList.add('img-dragging')
            item.customOffsetX = e.clientX - item.offsetLeft - 15
            item.customOffsetY = e.clientY - item.offsetTop - 90
        }
        /** drag end handler **/
        item.ondragend = () => {
            item.classList.remove('img-dragging')
        }
    })
}

/** create image from editor canvas **/
function createImageFromEditor() {
    const canvas = document.getElementById('editor')
    const imgSrc = canvas.toDataURL('image/png')
    //todo to server

    // const a = document.createElement('a')
    // a.href = imgSrc
    // a.download = "true"
    // a.title = "lle"
    // const linkText = document.createTextNode("my title text")
    // a.appendChild(linkText)
    // a.appendChild(linkText);
    // document.body.appendChild(a)
}

/** load background image to html **/
function loadBackGroundImage(imgURl) {
    const backGroundImageId = 'background-image'
    $(`#${backGroundImageId}`).remove()
    const img = document.createElement('img')
    img.style.display = 'none'
    img.src = imgURl
    img.id = backGroundImageId
    $(`#${ELEMENTS.editor}`).parent().append(img)
}

/** set background image which already exists on the page (display: none) **/
function setBackGround() {
    setImgAsBackground(editor, 'background-image')
}

/** remove background image **/
function resetBackGround() {
    editor.setBackgroundImage(0, editor.renderAll.bind(editor))
}

//todo костыль для инициализации, переделать по событию загрузки страницы
setTimeout(initialFunction, 500)