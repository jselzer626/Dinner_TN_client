import React, { useState, useEffect } from 'react';
import burger from './images/burger.png'
import crying from './images/crying.png'

function App() {
    
    const [input, setInput] = useState('')
    const [results, setResults] = useState([])
    const [resultIndex, setResultIndex] = useState(0)
    const [noResults, setNoResults] = useState(false)

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
            let fetchResults = await fetch(`https://api.spoonacular.com/recipes/search?query=${keywords}&
            informationinstructionsRequired=true&apiKey=${process.env.REACT_APP_RECIPE_API}&number=100`)
            let resultsJson = await fetchResults.json()

            if (resultsJson.length === 0)
                setNoResults(true)
            
            setResults(resultsJson.results)

        } 
        catch(e) {
            console.warn(e)
        }

    }

    const renderInputForm = results => {
         
        if (results.length === 0 && noResults === false) {
             return (
                <form className={'ui form'} onSubmit={handleSubmit}>

                    <div className={'field'}>
                        <img className="ui image fluid" src={burger}></img>
                        <label>What are you in the mood for?</label>
                        <input 
                            type='text' 
                            name='recipe_keywords' 
                            required 
                            onChange={handleInputChange}
                            placeholder="Search keywords, ingredients, cuisines etc.">
                            
                        </input>    
                    </div>
        
                    <button className={'massive fluid orange ui button'} type='submit'>Find something to eat!</button>
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
                <h4>{currentRecipe.title}</h4>
                <img className={"ui image fluid"} src={`https://spoonacular.com/recipeImages/${currentRecipe.id}-312x231.jpg`}></img>
                {<br/>}
                <button className={'massive fluid positive ui button'}>Text me the recipe!</button>
                {<br/>}
                <button 
                    className={'massive fluid negative ui button'}
                    onClick={() => {

                        let newIndex = resultIndex
                        setResultIndex(newIndex += 1)}

                    }
                >Show me another</button>
            </div>

        )
        
    }

    const noRecipesMessage = noResults => {

        if (noResults == true) {

            return (

                <div className="ui-container">
                        <h1 className="ui header">Oops!</h1>
                        <img className="ui image fluid" src={crying}></img>
                        <h4>There's no more recipes matching your search</h4>
                        <button 
                            className={'massive fluid orange ui button'}
                            onClick={() => setNoResults(false)}
                            >
                                Try something else!</button>
                </div>

            )
        }
    }



    // twilio module to text this?
    return (
        <div className="App">
            <h1 className="ui-header">Dinner TN</h1>
            {renderInputForm(results)}
            {renderRecipe(results)}
            {noRecipesMessage(noResults)}
        </div>
    )

}

export default App;