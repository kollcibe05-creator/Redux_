import { createSlice } from "@reduxjs/toolkit";
const uiSlice = createSlice({
    name: "ui",
    initialState: {
        isLoaderActive: false,
        modal: {isOpen: false, message: ''}
    },
    //we listen from other Slices here
    extraReducers: (builder) => {
        builder
        .addMatcher(
            (action) => action.type.endsWith("/pending"),
            (state) => {state.isLoaderActive = true}
        )
        .addMatcher(
            (action) => action.endsWith('fulfilled') || action.type.endsWith("/rejected"),
            (state, action) => {
                state.isLoaderActive = false;
                if (action.type.endsWith('/rejected')){
                    state.modal = {isOpen: true, message: "Oops! Something went wrong."}
                }
            }
        )
    }
})


export const {closeModal} = uiSlice.actions
export default uiSlice.reducer