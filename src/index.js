import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function square() {

}

function board({ markSquare }) {

    const handleClick = () => {
        e.preventDefault()
        if ()
    }
}


function App() {

    const [gameBoard, setGameBoard] = useState(Array(49).fill(null))

    const markSquare = (index, color) => {
        const newGameBoard = [... gameBoard]
        newGameBoard[index].color = color
    }

}