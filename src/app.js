import React, { useState, useEffect } from 'react'
import { Modal, Image } from 'semantic-ui-react'
import burger from './images/burger.png'
import crying from './images/crying.png'

function App() {
    
    const [input, setInput] = useState('')
    const [results, setResults] = useState([])
    const [resultIndex, setResultIndex] = useState(0)
    const [noResults, setNoResults] = useState(false)
    const [SMSFormOpen, setSMSFormOpen] = useState(false)
    const [recipeDetails, setRecipeDetails] = useState({})

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
            instructionsRequired=true&apiKey=${process.env.REACT_APP_RECIPE_API}&number=100`)
            let resultsJson = await fetchResults.json()     
            
            // actual recipe recipes are in results key of response object
            if (resultsJson.results.length === 0)
                setNoResults(true)

            setResults(resultsJson.results)
        } 
        catch(e) {
            console.warn(e)
        }

    }

    const handleRecipeSelection = async (e, recipeId) => {

        e.preventDefault()

        try {

            let fetchResults = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?
            includeNutrition=false&apiKey=${process.env.REACT_APP_RECIPE_API}`)

            let resultsJson = await fetchResults.json()

            if (resultsJson.length === 0)
                return
            
            setRecipeDetails(resultsJson)

        } catch(e) {
            console.warn(e)
        }
    }

    const renderInputForm = results => {
         
        if (results.length === 0 && !noResults) {
             return (
                <form className={'ui form'} onSubmit={handleSubmit}>

                    <div className={'field'}>
                        <img className="ui image fluid" src={burger}></img>
                        <h4>What are you in the mood for?</h4>
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
        // first checking if search returned no results
        if (!currentRecipe && noResults) {
            return (

                <div className="ui-container">
                        <h1 className="ui header">Oops!</h1>
                        <img className="ui image fluid" src={crying}></img>
                        <h4>No recipes matching "{input}"</h4>
                        <button 
                            className={'massive fluid orange ui button'}
                            onClick={() => setNoResults(false)}
                            >
                                Try something else!</button>

                </div>

            )}
        // then checking if application just loaded (i.e. noResults is still false)
        else if (!currentRecipe) {
            return
        }
        
        return (

            <div className="ui-container">
                <h4>{currentRecipe.title}</h4>
                <img className={"ui image fluid"} src={`https://spoonacular.com/recipeImages/${currentRecipe.id}-312x231.jpg`}></img>
                {<br/>}
                <button 
                    className={'massive fluid positive ui button'}
                    onClick={(e) => {
                        handleRecipeSelection(e, currentRecipe.id)
                        setSMSFormOpen(true)
                    }}
                    >Text me the recipe!
                    </button>
                {<br/>}
                <button 
                    className={'massive fluid negative ui button'}
                    onClick={() => {

                        let newIndex = resultIndex
                        setResultIndex(newIndex += 1)}

                    }
                >Show me another</button>
                <div className="newSearch">
                    <p>You searched: <b>{input}</b></p>
                    <button 
                        className="ui button orange"
                        onClick={() => {
                            setResults([])
                        }}
                        >New Search
                    </button>
                </div>
            </div>

        )
        
    }

    const sendRecipeSMS = SMSFormOpen => {
        
        //cleaning extended ingredients into concise readable string
        let ingredients = ''
        let imageURL

        if (recipeDetails.extendedIngredients) {
            recipeDetails.extendedIngredients.forEach(item => {
            ingredients += item.originalString += '\n'
            })
            imageURL = recipeDetails.image
        }

        return (
            <Modal
                open={SMSFormOpen}
                onClose={() => setSMSFormOpen(false)}
                >
                <Modal.Header>Get this via text</Modal.Header>
                <Modal.Content>
                <Image size='small' src={imageURL} wrapped />
                    <Modal.Description>
                        <p>You will receive two messages, one containing ingredients and one containing directions.</p>
                        <form>
                            <input
                                type="text"
                                name="number"
                                required
                            ></input>
                            <input
                                hidden
                                value={ingredients}
                                name="ingredients"
                            >
                            </input>
                            <input
                                hidden
                                value={recipeDetails.instructions}
                                name="recipe"
                            >
                            </input>
                        </form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <button className="orange" type="submit"></button>
                </Modal.Actions>
            </Modal>
        )
    }

    return (
        <div className="App">
            <h1 className="ui-header">Dinner TN</h1>
            {renderInputForm(results)}
            {renderRecipe(results)}
            {sendRecipeSMS(SMSFormOpen)}
        </div>
    )

}

export default App;