import React, { useState, useEffect } from 'react'
import { Modal, Image } from 'semantic-ui-react'
import burger from './images/burger.png'
import crying from './images/crying.png'
import turkey from './images/turkey.png'
import spoonacular from './images/Spoonacular.png'
import twilio from './images/twilio.png'
import success_check from './images/success_check.png'

function App() {
    
    const [input, setInput] = useState({search:'', number:''})
    const [results, setResults] = useState([])
    const [resultIndex, setResultIndex] = useState(0)
    const [noResults, setNoResults] = useState(false)
    const [SMSFormOpen, setSMSFormOpen] = useState(false)
    const [recipeDetails, setRecipeDetails] = useState({})
    const [sendStatus, setSendStatus] = useState({sent:false, success:false, serverError:false})
    const [showAbout, setShowAbout] = useState(false)

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

             <h3>Find a recipe. Get it texted to you.{<br/>}No ads. No blogs. No stress.</h3>
                    <div className={'field'}>
                        <img className="ui image fluid startImg" src={burger}></img>
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
                    <div>
                        <a href="#" onClick={() => setShowAbout(true)}>About</a>
                    </div>
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
                        <h2>No recipes matching "{input.search}"</h2>
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
                <Modal.Header>Text Me {recipeDetails.title}</Modal.Header>
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

    const renderAboutSection = showAbout => {

        return (
            <Modal
                open={showAbout}
                onClose={() => setShowAbout(false)}
            >
                <Modal.Header>
                    No More Recipe Blogs!
                </Modal.Header>
                <Modal.Content>
                    Ever tried to quickly look up recipes and then got lost in a sea of cooking photos, ads and paragraphs
                    about some blogger's life story as it relates to lasagna?
                    {<br/>}
                    Dinner TN finds you a bunch of recipes, you pick one and then we send a text with ingredients and directions.
                    That's it. Just plain text of what you need to know to actually make the dish.
                    {<br/>}
                    You can search anything that might relate to food. Ingredients, styles, cuisine nationalities, flavors and more.
                    We're connected to a database of over 350,000 recipes (courtesy of Spoonacular) so I bet you can probably
                    find something.
                    {<br/>}
                    Oh, and our messaging is totally secure. We use Twilio to process and send all correspondence. You can learn more about What
                    they do <a href="https://www.twilio.com/" target="blank">here.</a>
                    {<br/>}
                    Anyways, go and try it out. Type anything you want. I tried "chocolate enchiladas strawberries cheese" the other day.
                    {<br/>}
                    Bon Appetit!
                    <div className="aboutImages">
                        <img className="ui image small" src={spoonacular}/>
                        <img className="ui image small" src={twilio}/>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                <button className="ui large fluid button negative" onClick={() => setShowAbout(false)}>Take me back</button>
                </Modal.Actions>
        
            </Modal>
        )
    }

    return (
        <div className="App">
            <h1 className="ui-header mainHeader"><img className="headerImg" src={turkey}></img>Dinner TN<img className="headerImg" src={turkey}></img></h1>
            {renderInputForm(results)}
            {renderRecipe(results)}
            {sendRecipeSMS(SMSFormOpen)}
            {renderAboutSection(showAbout)}
        </div>
    )

}

export default App;