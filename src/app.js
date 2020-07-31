import React, { useState, useEffect } from 'react';
import './App.css';

const InputForm = (props) => (




  
        <form className={'ui form'} onSubmit={handleSubmit}>

        <div className={'field'}>
            <label>What are you in the mood for?</label>
            <input 
                type='text' 
                name='recipe_keywords' 
                required 
                onChange={e => setValue(e.target.value)}
                placeholder="Search keywords, ingredients, cuisines etc.">
                
            </input>    
        </div>

        <button className={'massive fluid positive ui button'} type='submit'>Search Recipes</button>
    </form>

)

function App() {

    const [keywords, setKeywords] = useState({})
    const [results, setResults] = useState({})

    const searchKeywords = async (e) => {
        e.preventDefault()

        try {
            let pin = in
        }


    }



}