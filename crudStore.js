import { configureStore } from "@reduxjs/toolkit";
import movieReducer from "./movieSlice"

//The strategy below is a counter to redux-persist library. 


/*The Retrieval logic */
// Its job is to reach in the browsers long-term memory and bring data back into the app 

const loadFromLocalStorage = () => {
    try{
        const serializedState = localStorage.getItem("movieState");  //Attemps to fetch a string labelled "movieState" from local storage.  'movieState' is set by one as long as setItem and getItem use the same word.
        if (serializedState == null) return undefined;  //since localStorage only stores strings, it uses JSON.parse to turn that string back into a JS object. 
        return JSON.parse(serializedState)
    }catch (e) {
        return undefined //If nothing is found, it returns undefined which tells Redux to use the initial state defined in the Slice.
    }
    //Wrapped in a try..catch as JSON.parse will crash one's app if data is corrupted or formatted incorrectly.
}


export const store = configureStore({
    reducer: {
        movies: movieReducer
    },
    preloadedState: {     //The initial injection.  It allows one to 'hydrate' the Redux store with data before the app even finishes booting up.  
        movies: loadFromLocalStorage()  //By passing this we are telling Redux, "Don't start with an empty movie list, start with whatever we found in the browser's storage."
    }
                                       //This prevents the "flicker" where an app looks empty for a split second loading data     
})

//This is the Automatic Sync.  
// It acts as a "listener" that triggers every single time an action is dispatched and the state changes.  


//saves on every state change ~ persists only needed slices

//Every time one adds a movie, deletes a movie or updates a rating of a Movie, the function inside `.subsribe()` runs 
store.subscribe(() => {
    const state = store.getState();  //grabs the brand-new version of one's data
    localStorage.setItem("movieState", JSON.stringify(state.movies)) // overwrites the old saved string with the new version
})                                  //We are only saving state.movies. This is smart because it keeps one's localStorage clean, ignoring temporary UI states (like "isModalOpen") that you probably want to persist.

//CAVEATS
// Using store.subscribe() to save to localStorage is very effective for small apps, but keep in mind that JSON.stringify is a "synchronous" operation. So if your movies state becomes massive, running it on every single state change could eventually cause a slight stutter in UI performance. Use in hobby and medium-sized projects. 

// Use Debouncing/Throttling the store
// If you are still using store.subscibe logic with localStoragr, make sure you aren't saving too often. 
// Use a simple "debounce" function so that if 5 thunks finish in a row, you only write to local storage once at the very end.



/*
When dealing with Redux slices the "Pro" formats that ensure that createAsyncThunk works efficiently are:  
    1. useSelector
We don't grab the whole state, we use specific selectors so components only re-render when the exact data they need change.  
    2. Entity Adapter(createEntityAdapter)
Redux Toolkit has it as a built-in tool.
It stores data in a 'normalized" format (like a database map) rather than a long array.
Efficiency: Finding or updating one item in a list of 1,000 becomes O(1) instead of O(n)

*/