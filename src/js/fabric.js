'use strict'

//todo auto size by window dimension

$(document).ready(() => {
    /** create different boxes **/
    createCanvas('plan-container', 'plan', 600, 400)
    createCanvas('tools-container', 'tools', 600, 400)
    createCanvas('editor-container', 'editor', 1000, 800)

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

    setImgAsBackground(editor, 'map')

    /** set all handlers using object notation **/
    // tools.on({
    //     'mouse:down': e => {
    //         console.log(e.target)
    //     }
    // })
})

function createCanvas(containerId, canvasId, width, height) {
    $(`#${containerId}`).append(`<canvas id="${canvasId}" width="${width}" height="${height}"></canvas>`)
}

function createRect(width, height, position) {
    return new fabric.Rect({
        left: position.left,
        top: position.right,
        width: width,
        height: height,
        fill: 'rgba(255,0,0,0.5)',
        transparentCorners: false,
        hasBorders: false,
        hasControls: false,
        editable: false,
        selectable: false
    })
}

function setImgAsBackground(fabricCanvas, imgId) {
    const fabricImg = createImg(imgId)
    const scaleFactor = Math.min(fabricCanvas.width / fabricImg.width, fabricCanvas.height / fabricImg.height)
    fabricImg.scale(scaleFactor)
    if (fabricImg.height < fabricCanvas.height) {
        const top = (fabricCanvas.height - fabricImg.height) / 2
        fabricImg.top = top
    }
    fabricCanvas.setBackgroundImage(fabricImg, fabricCanvas.renderAll.bind(fabricCanvas), {
        originX: 'left',
        originY: 'top'
    })
}

function createImg(imgId, top, left) {
    const imgElement = document.getElementById(imgId)
    return new fabric.Image(imgElement)
}