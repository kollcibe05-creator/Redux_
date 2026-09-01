To use fetched API data for use as the initial state of a slice, the most scalable and reliable approach is to use `preloadedState` in `configureStore`.  
The slices should be kept completely neutral with basic, default initial states, and then `hydrate` them when assembling the store using `configureStore`.  
This approach overrides the slice's defaults seamlessly.   
```js
import {createSlice} from '@reduxjs/toolkit'
const initialState = {
    items: [], 
    loading: false
}
const productSlice = createSlice({
    name: 'products',
    initialState, // Default fallback
    reducers: {
        addProduct(state, action) {
        state.items.push(action.payload);
        },
    },
})
```
```js
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';

// Hypothetically fetched data
const fetchedProducts = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Phone' }
];

// 2. Pass it to the preloadedState option
const store = configureStore({
  reducer: {
    products: productsReducer,
  },
  // The structure here must match the reducer object keys
  preloadedState: {
    products: {
      items: fetchedProducts,
      loading: false,
    },
  },
});

export default store;
```
Another approach(least effective) would be to use a component to do the fetch request then dispatch the data as payload which will be used to update state.   
The normal syntax of using `useEffect` is followed and the initialState of the slice takes in an empty object.  
