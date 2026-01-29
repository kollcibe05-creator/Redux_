import { createSlice } from "@reduxjs/toolkit"; 

const initialState = {
    movies: [{id: 1, name: "Mad Max Furiosa"}, {id: 2, name: "Grey Man"}, {id: 3, name: "Until Dawn"}]
}
const movieSlice = createSlice({
     
    name: "movies", 
    initialState,
    reducers: {
        addMovie: (state, action) => {
            const newMovie = {
                    id:     state.movies[state.movies.length -1].id + 1,
                    name:   action.payload 
                }
            // state.movies.push(action.payload)
            state.movies.push(newMovie)
        }, 
        removeMovie: (state, action) => {
            state.movies = (state.movies).filter(movie =>  movie.id  !== action.payload)


        },
    }
})

export const {addMovie, removeMovie} = movieSlice.actions;
export default movieSlice.reducer;