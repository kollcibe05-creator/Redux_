import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeMovie } from "../../movieSlice";



export const MovieList = () => {
    const movies = useSelector(state => state.movies.movies)
    console.log(movies)
    const dispatch = useDispatch()
    const handleDelete = (id) => {
        
        dispatch(removeMovie(id));
        

    } 
    return (
        <div>
           <h1> Movie List</h1>
           {movies.map(movie =>(
            <div key={movie.id}>{movie.name} <button onClick={() => handleDelete(movie.id)}>Delete</button></div>
           ) )}
        </div>
    )
}