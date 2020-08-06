'use strict'
const _$ = go.GraphObject.make

const myDiagram = _$(go.Diagram, "myDiagramDiv", {
    'undoManager.isEnabled': true
})

const myModel = _$(go.Model)

myModel.nodeDataArray = [
    {key: "Kek_1"},
    {key: "Kek_2"},
    {key: "Kek_3"}
]

myDiagram.model = myModel