import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


export const fetchMovies = createAsyncThunk("movies/fetchMovies", () => {
    return fetch("https://movies.com")
    .then(r => {
        if (!r.ok) throw Error("Failed to fetch movies")
        return r.json()    
    })
    .then(data => data)   //data becomes the action.payload
})

export const addMovieApi = createAsyncThunk("movies/addMovieApi", (movieName) => {
    return fetch('https://movies.com', {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        
        body: JSON.stringify({name: movieName})
        })
        .then(r => {
            if(!r.ok) throw Error("Failed to add the movies")
            return r.json()    
        })
        .then(data => data)
    
})

const movieSlice = createSlice({
    name: "movies",
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMovies.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchMovies.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload;
        })
        .addCase(fetchMovies.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })
        .addCase(addMovieApi.fulfilled, (state, action) => {
            state.items.push(action.payload)
        })
    }
})

export default movieSlice.reducer
