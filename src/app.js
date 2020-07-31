import React, { useState, useEffect } from 'react';
import burger from './images/burger.png'

function App() {
    
    const [input, setInput] = useState('')
    const [results, setResults] = useState([])
    const [resultIndex, setResultIndex] = useState(0)

    const handleInputChange = e => {
        let newInput = input
        newInput = e.currentTarget.value
        setInput(newInput)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            let keywords = input
            if (!keywords)
                return 
            setInput('')
            let fetchResults = await fetch(`https://api.spoonacular.com/recipes/search?query=${keywords}&
            informationinstructionsRequired=true&${process.env.REACT_APP_RECIPE_API}`)
            let resultsJson = await fetchResults.json()

            if (resultsJson.length === 0)
            return
        
            setResults(resultsJson.results)

        } 
        catch(e) {
            console.warn(e)
        }

    }

    const renderInputForm = results => {
        console.log(process.env)
         if (results.length === 0) {
             return (
                <form className={'ui form'} onSubmit={handleSubmit}>

                    <div className={'field'}>
                        <img src={burger}></img>
                        <label>What are you in the mood for?</label>
                        <input 
                            type='text' 
                            name='recipe_keywords' 
                            required 
                            onChange={handleInputChange}
                            placeholder="Search keywords, ingredients, cuisines etc.">
                            
                        </input>    
                    </div>
        
                    <button className={'massive fluid positive ui button'} type='submit'>Find something to eat!</button>
                </form>
             )
         }
    }

    const renderRecipe = results => {

        let currentRecipe = results[resultIndex] ? results[resultIndex] : null

        if (!currentRecipe)
            return
        
        return (

            <div className="ui-container">
                <h4>currentRecipe.title</h4>
                <img src={`https://spoonacular.com/recipeImages/${currentRecipe.id}-312x231.jpg`}></img>
                <button>Text me this</button>
                <button>Show me another</button>
            </div>

        )
        
    }

    // twilio module to text this?
    return (
        <div className="App">
            {renderInputForm(results)}
        </div>
    )

}

export default App;