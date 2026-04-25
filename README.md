Redux is a library extracted from the Hook `useReducer`.  
It is a state management library centralizing state and thus extricate factors like prop drilling and state being out of sync.   
It has an `immutable store` where all the data, state, is stored.   
When a change occurs, like a like or comment, an `action` is `dispatch`ed with a `name` and a `payload` which contains the data that needs to be changed.   
Remember that the `store` is immutable so for a dispatch an entirely `new object` is created by passing the `current state` and the `payload` to a reducer function. Which retuurns a new object with  the entire  application state.  The end result is a one-way data flow that is predictable and testable.  
*To have a real-time perception of the changes in your app, install the Chrome Dev Tools redux extension.*  
# Installation
```
npm install @reduxjs/toolkit react-redux
```
# Provider
React Redux includes a `<Provider>` which makes the Redux store available to the rest of the components.  
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from '../store.js'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </StrictMode>,
)

```
# Redux Store
One needs to import the `configureStore` API from Redux Toolkit.   
The **reducer** parameter is an object which holds the fields holding the reducer functions to handle all updates to a specific state.  
The field contains:   
1. state name used to access the state by the components.  
2. Reducer which as already stated handles all the updates to the state.  
```jsx
import { configureStore } from "@reduxjs/toolkit";
import movieReducer from  "./movieSlice"
import todoReducer from "./todoSlice"


export const store = configureStore({
     reducer: {    //takes two props ~ a state and an action
        movies: movieReducer,
        todos: todoReducer
     }
})  
```
# Redux State Slice
Creating a slice requires: 
1. a `string name`to identify a slice. 
2. an `initial state`
3. one or more `reducer functions` under the `reducers` property to determine how state can be updated.    
Once a slice is created, we can export the generated Redux action creators and the reducer function for the whole slice.    
*The name attribute is key in the essence that it used by Redux to ensure that one's action names,  are unique across the entire application. It serves as a `namespace` for the generated action types. When one defines a reducer like `addMovie` inside a slice called `"movies"`, Redux Toolkit automatically generates the action type: `movies/addMovie`.*  
```jsx
import { createSlice } from "@reduxjs/toolkit";

const todos = [
    {
        id: 1, 
        todo: "Finish Reading \"The Laws of Human Nature\"",
        done: false
    }, 
     {
        id: 2, 
        todo: "Go over React Redux",
        done: false
    }, 
     {
        id: 3, 
        todo: "Be a good person",
        done: false
    }, 
]

const todoSlice = createSlice ({
    name: "todos", 
    initialState: {
        list: todos, 
        loading: false
    }, 
    reducers: {
        addTodo: (state, action) => {
            const newTodo = {
                id: state.list[state.list.length - 1].id + 1, 
                todo: action.payload, 
                done: false
            }
            state.list.push(newTodo)
        }, 
        removeTodo: (state, action) => {
            state.list = state.list.filter(todo => todo.id !== action.payload)
        },
    }
})

export const {addTodo, removeTodo} = todoSlice.actions
export default todoSlice.reducer
```
# Hooks 
React Redux Provides a pair of custom Hooks that allow one's components to interact with the Redux store.  
**useSelector** reads a value from the store and subscribes to updates.  
**useDispatch** returns the store's `dispatch` `method` to let one dispatch actions.  
```jsx
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { removeTodo } from "../../todoSlice"
function TodoList () {
    const todos = useSelector( state => state.todos.list)
    const dispatch = useDispatch()

    function handleDelete (id) {
        dispatch(removeTodo(id))
    } 
    return (
        <ul>
            {todos.map( todo => (
                <li key={todo.id} onClick={() => handleDelete(todo.id)}>
                    {todo.todo}
                </li>
            ))}
        </ul>
    )
}
export default TodoList

```
