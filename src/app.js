import React, { useState, useEffect } from 'react'
import { Modal, Image } from 'semantic-ui-react'
import burger from './images/burger.png'
import crying from './images/crying.png'
import turkey from './images/turkey.png'
import success_check from './images/success_check.png'

function App() {
    
    const [input, setInput] = useState({search:'', number:''})
    const [results, setResults] = useState([])
    const [resultIndex, setResultIndex] = useState(0)
    const [noResults, setNoResults] = useState(false)
    const [SMSFormOpen, setSMSFormOpen] = useState(false)
    const [recipeDetails, setRecipeDetails] = useState({})
    const [sendStatus, setSendStatus] = useState({sent:false, success:false, serverError:false})

    // need to consolidate these two functions
    const handleInputChange = e => {
        setInput({...input,search:e.currentTarget.value})
    }
    
    const handleNumberChange = e => {
        setInput({...input,number:e.currentTarget.value})
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault()

        try {
            let keywords = input.search
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

    const handleRecipeSend = async (e) => {
         
        e.preventDefault()

        // clean up ingredients list
        let ingredientsClean = ''

        if (recipeDetails.extendedIngredients) {
            recipeDetails.extendedIngredients.forEach(item => {
            ingredientsClean += item.originalString += '\n'
            })
        }

        try {
            let SMSForm = new FormData()
            SMSForm.append('number', input.number)
            SMSForm.append('ingredients', ingredientsClean)
            SMSForm.append('recipe', recipeDetails.instructions)

            let fetchResults = await fetch('http://localhost:5000/', {
                method: 'POST',
                body: SMSForm
            })

            setSendStatus({...sendStatus,sent:true})
            
            let resultsJson = await fetchResults.json() 


            if (resultsJson)
                setSendStatus({...sendStatus,success:true})

        } catch(e) {
            setSendStatus({...sendStatus,serverError:true})
            console.warn(e)
        }
    }


    const renderInputForm = results => {
         
        if (results.length === 0 && !noResults) {
             return (
                <form className={'ui form'} onSubmit={handleSubmit}>

                    <div className={'field'}>
                        <img className="ui image fluid" src={burger}></img>
                        <h2>What are you in the mood for?</h2>
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
                        <img className="medium fluid" src={crying}></img>
                        <h4>No recipes matching "{input.search}"</h4>
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
                <h2>{currentRecipe.title}</h2>
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
                    <p>You searched: <b>{input.search}</b></p>
                    <button 
                        className="ui button orange"
                        onClick={() => {
                            setResults([])
                            setResultIndex(0)
                        }}
                        >New Search
                    </button>
                </div>
            </div>

        )
        
    }

    const sendRecipeSMS = SMSFormOpen => {

        let imageURL

        if (recipeDetails)
            
        imageURL = recipeDetails.image
            
            let resetButton = <button className="ui button orange massive fluid" onClick={() => {
                //noResults can stay false
                setResults([])
                setResultIndex(0)
                setSendStatus({sent:false, success:false})
                setSMSFormOpen(false)
                setInput({search:'', number:''})
            }}>Back</button>

            // outcome handling after message send
            if (sendStatus.success) {
                return (
                    <Modal>
                        <Modal.Header>Success - message sent!</Modal.Header>
                        <Modal.Content>
                            <Image src={success_check} size="small"></Image>
                            <p>Bon Appetit!</p>
                        </Modal.Content>
                        <Modal.Actions>
                            {resetButton}
                        </Modal.Actions>
                    </Modal>)
            } else if (sendStatus.sent && !sendStatus.success || sendStatus.serverError) {
                return (
                    <Modal>
                        <Modal.Header>Oops - Message Error</Modal.Header>
                        <Modal.Content>
                            <Image src={crying} size="small"></Image>
                            <p>Something didn't work. Please try again!</p>
                        </Modal.Content>
                        <Modal.Actions>
                            {resetButton}
                        </Modal.Actions>
                    </Modal>)
            }

        return (
            <Modal
                open={SMSFormOpen}
                onClose={() => setSMSFormOpen(false)}
                >
                <Modal.Header>Text me {recipeDetails.title}</Modal.Header>
                <form onSubmit={handleRecipeSend}>
                <Modal.Content>
                    {<br/>}
                <Image size='small' src={imageURL} wrapped />
                <p>You will receive a text containing instructions and ingredients</p>
                    <label>Phone Number</label>
                    {<br/>}
                    <input
                        type="text"
                        name="number"
                        required
                        onChange={handleNumberChange}
                        minLength='10'
                        maxLength='10'
                    ></input>
                </Modal.Content>
                <Modal.Actions>
                    <button className="ui button positive" type="submit">Send me this</button>
                    <button className="ui button negative" onClick={() => setSMSFormOpen(false)}>Take me back</button>
                </Modal.Actions>
                </form>
            </Modal>
        )
    }

    return (
        <div className="App">
            <h1 className="ui-header"><img className="headerImg" src={turkey}></img>Dinner TN<img className="headerImg" src={turkey}></img></h1>
            {renderInputForm(results)}
            {renderRecipe(results)}
            {sendRecipeSMS(SMSFormOpen)}
        </div>
    )

}

export default App;