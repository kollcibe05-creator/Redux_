import React from "react";
import { useSelector } from "react-redux";


export const Spinner = () => {
    const isLoading = useSelector(state => state.ui.isLoaderActive);
    return isLoading ? <div className="spinner">Loading...</div> : null
}