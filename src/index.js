import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function Square({index, markSquare}) {

    return (
        <button onClick={() => markSquare(index)}>
            {index}
        </button>
    )
}


function App() {

    const [gameBoard, setGameBoard] = useState(Array(16).fill({color: null}))
    const [redIsNext, setRedIsNext] = useState(true)
    

    const markSquare = index => {
        const newGameBoard = [...gameBoard]
        newGameBoard[index].color = redIsNext ? "red" : "black"
        setGameBoard(newGameBoard)
    }

    return (
        <div className="gameBoard">
            {gameBoard.map((square, index) => (
                <Square
                    key={index}
                    index={index}
                    markSquare={markSquare}
                />
            ))} 
        </div>

    )

}

ReactDOM.render (
    <div>
        <App />
    </div>,
    document.querySelector("#root")
)