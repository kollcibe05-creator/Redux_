import { configureStore } from "@reduxjs/toolkit";
import movieReducer from "./movieSlice"

const loadFromLocalStorage = () => {
    try{
        const serializedState = localStorage.getItem("movieState");
        if (serializedState == null) return undefined;
        return JSON.parse(serializedState)
    }catch (e) {
        return undefined
    }
    
}


export const store = configureStore({
    reducer: {
        movies: movieReducer
    },
    preloadedState: {
        movies: loadFromLocalStorage()
    }
})


//saves on every state change ~ persists only needed slices
store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem("movieState", JSON.stringify(state.movies))
})