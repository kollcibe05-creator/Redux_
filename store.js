import { configureStore } from "@reduxjs/toolkit";
import movieReducer from  "./movieSlice"



export const store = configureStore({
     reducer: {    //takes two props ~ a state and an action
        movies: movieReducer,
     }
})  