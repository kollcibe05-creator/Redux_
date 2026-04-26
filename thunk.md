**thunk** in programming means a piece of code that does some delayed work.  
For Redux specifically, they are patterns of writing functions with logic inside that can interact with a Redux store's `dispatch` and `getState`.  
Using thunks requires the `redux-thunk` `middleware` to be added tp the Redux store as part of its confiiguration.    
Thunks are  a standard approach for writing async logic in Redux apps, and are commmonly used for data fetching. However, they can be used for a variety of tasks, and can contain both synchronous and asynchronous logic.   
# Using `createAsyncThunk`
Writing async logic with thunks can be somewhat tedious. Each thunk typically requires defining three different action types + matching action creators for "pending/fulfilled/rejected", plus the actual thunk action creator + thunk function. There's also the edge cases with error handling to deal with.  
Redux Toolkit has the `createAsyncThunk API` that abstracts the process of generating those actions, dispatching them based on a `Promise` lifecycle.  
It accepts a partial action type string (used to generate the action types for `pending`, `fulfilled`, and `rejected`), and a `"payload creation callback"` that does the actual async request and returns a `Promise`.  
It then automatically dispatches the actions before and after the request, with the right arguments.  
Since `this is an abstraction for the specific use case of async requests`, `createAsyncThunk does not address all possible use cases for thunks`. If you need to write synchronous logic or other custom behavior, you should still write a "normal" thunk by hand yourself instead.   
The thunk action creator has the action creators for `pending`, `fulfilled`, and `rejected` attached. You can use the `extraReducers` option in `createSlice` to listen for those action types and update the slice's state accordingly.    
```jsx
import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"

//imports and state

export const fetchTodos = createAsyncThunk("todos/fetchTodos",  async () => {
    const response = await client.get("/api/todos")
    return response.todos
})

const todoSlice = createSlice({
    name: "todos", 
    initialState, 
    reducers: {
        //ommitted
    }, 
    extraReducers: builder => {
        builder
        .addCase(fetchTodos.pending, (state, action) => {
            state.status = "loading"
        })
        .addCase(fetchTodos.fulfilled, (action, payload) => {
            state.todos = action.payload
            state.status = "idle"
        })
        .addCase(fetchTodos.rejected, (state, action) => {
            state.status = "error"
            state.error = action.payload
        })
    }
})
```
Using `fetch`; 
```jsx
export const addCategory = createAsyncThunk("categories/addCategory", (categoryObject) => {
    return fetch("/api/categories", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json", 
            "Accept": "application/json"
        }, 
        body: JSON.stringify(categoryObj)
    })
    .then( r => r.json())
    .then( data => data)
})
```
## Parameters
It accepts `three` parameters: 
1. a string action `type` value.  
2. a `payloadCreator` callback
3. an `options` object.  

## type 
A string that will be used to generate additional Redux action type constants, representing the lifecycle of an async request.  
Eg. a `type` argument of `"users/requestStatus"` will generate these action types:   
- `pending`: `"users/requestStatus/pending"`
- `fulfilled`: `"users/requestStatus/fulfilled"`
- `rejected`: `"users/requestStatus/rejected"`

## payloadCreator
A callback function that should return a promise containing the result of some asynchronous logic.  
It may also return the value synchronously.  
If there is an error, it should either return a rejected promise containing an `Error` instance or a plain value such as a descriptive message or otherwise a resolved promise with a `RejectWithValue` argument as returned by the `thunkAPI.rejectWithValue` function.  
The `payloadCreator` function will be called with `two` args:   
1. `arg` a single value, containing the first parameter that was passed to the thunk action creator when it was dispatched.  
Useful for passing in values like item IDs that may be needed as part of the request.  
If you need to pass in multiple values, pass them together as an object when you dispatch the thunk like `dispatch(fetchUsers({status: 'active', sortBy: 'name'}))`.   
2. `thunkAPI` an object containing all of the parameters that are normally passed to a Redux thunk function, as well as additional parameters.   
- `dispatch`: the Redux store dispatch method.  
- `getState`: the Redux store *getState* method.  
- `extra`: the 'extra argument' given to the thunk middleware on setup, if available.   
- `requestId`: a unique string ID value that was automatically generated to identify this request sequence.  
- `signal`: an `Abortcontroller.signal` `object` that may be used to see if another part of the app logic has marked this request as needing a cancellation.   
- `rejectWithValue(value, [meta])`: rejectWtihValue is a utility function that you can `return`(or `throw`) in your action creator to return a rejected response with a defined payload and meta.  
It will pass whatever value you give it and return it in the payload of the rejected action.  
If you also pass in a `meta`, it will be merged with the existing `rejectedAction.meta`   
- `fulfillWithValue(value, meta)`: fulfillWithValue is a utility function that you can `return` in your action creator to `fulfill` with a value while having the ability of adding to `fulfilledAction.meta`.   

## options 
An `object` with the following optional fields: 
- `condition(arg, {getState, extra}): boolean | Promise<boolean>`: a callback that can be used to skip the execution of the payload creator and all the action dispatches, if desired.  
- `dispatchConditionRejection`: if `condition()` returns `false`, the default behaviour is that no actions will be dispatched at all.    
If you still want a 'rejected' action to be dispatched when the thunk was cancelled, set this flag to `true`.  
- `idGenerator(arg): string`: a function to use when generating the `requestId` for the request sequence.  
Defaults to nanoid but one can implement one's own ID generation logic.  
- `serializeError(error: uknown) => any`: to replace the internal `miniSerializer` method with your own serialization logic.  
- `getPendingMeta({arg, requestId}, {getState, extra}): any` a function to create an object that will be merged into the `pendingAction.meta` field.   

### Return Value
createAsyncThunk returns a standard Redux thunk action creator.  
The thunk action creator function will have a plain action creators for the `pending`, `fulfilled` and `rejected` cases attached as nested fields.  
Using the `fetchUserById` example above, createAsyncThunk will generate four functions:
- `fetchUserId`, the thunk action creator that kicks off the async payload callback you wrote.  
    - `fetchUserById.pending`, an action creator that dispatches an 'users/fetchByIdStatus/pending' action
    - `fetchUserById.fulfilled`, an action creator that dispatches an `'users/fetchByIdStatus/fulfilled'` action
    - `fetchUserById.rejected`, an action creator that dispatches an `'users/fetchByIdStatus/rejected'` action

When dispatched, the thunk will:      
dispatch the `pending` action
call the `payloadCreator` callback and wait for the returned promise to settle  
- when the promise settles:  
    - if the promise resolved successfully, dispatch the `fulfilled` action with the promise value as `action.payload`
    - if the promise resolved with a `rejectWithValue(value)` return value, dispatch the `rejected action` with the value passed into `action.payload` and 'Rejected' as `action.error.message`  
    - if the promise failed and was not handled with `rejectWithValue`, dispatch the `rejected` action with a serialized version of the error value as `action.error`  
- Return a fulfilled promise containing the final dispatched action (either the `fulfilled` or `rejected` action object)     

```jsx
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue, dispatch, getState }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      return rejectWithValue('Not authenticated');
    }
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch cart');
  } 
});

```
```jsx
const handleAsyncError = (err, dispatch, defaultMessage, rejectWithValue) => {
  dispatch(hideSpinner());
  const message = err.response?.data?.error || defaultMessage;
  dispatch(showNotification({ type: 'error', title: 'Error', message }));
  return rejectWithValue(message);
};

export const processMpesaPayment = createAsyncThunk(
  'cart/processMpesaPayment',
  async (paymentData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showSpinner({ message: 'Initiating M-Pesa payment...' }));
      const res = await api.post('/payments/mpesa', paymentData); 
      dispatch(hideSpinner());
      dispatch(showNotification({ 
        type: 'success', 
        title: 'Success', 
        message: 'Payment request sent to your phone!' 
      }));
      return res.data;
    } catch (err) {
      return handleAsyncError(err, dispatch, 'M-Pesa payment failed', rejectWithValue);
    }
  }
);
```
```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { processMpesaPayment } from './store/cartSlice'; // Path to your slice

const MpesaCheckout = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(100);
  const dispatch = useDispatch();
  
  // Optional: Get loading state if you want to disable the button locally
  const { isProcessing } = useSelector((state) => state.cart);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      phone: phoneNumber,
      amount: amount,
    };

    // Dispatching the thunk
    try {
      // .unwrap() allows you to catch the error or handle success 
      // directly in the component if needed.
      await dispatch(processMpesaPayment(paymentData)).unwrap();
      
      // If we reach here, payment was initiated successfully
      console.log("Prompt sent to phone successfully!");
      // Logic like: router.push('/confirmation')
      
    } catch (error) {
      // The error is already handled by handleAsyncError (notifications/spinners)
      // but you can log it here or set local component error states
      console.error("Payment initiation failed:", error);
    }
  };

  return (
    <div className="payment-container">
      <h3>M-Pesa Express Checkout</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="tel"
          placeholder="2547XXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
        </button>
      </form>
    </div>
  );
};

export default MpesaCheckout;
```
Note that even though the thunk handles notifications, you can still use the `.unwrap()` method if you need to perform `"local"` logic (like `redirecting the user`) `after a success`.  
*If you don't use `.unwrap()`, the `dispatch()` call always returns a resolved promise (an object containing the action).*  
*If you do use `.unwrap()`, Redux Toolkit will throw an actual error if the thunk failed, allowing your component to use a standard `try/catch` block for navigation or local state resets.*   
```jsx
// 1. Fire and Forget (Simplified)
// Use this if the Notification popup is enough for the user.
dispatch(processMpesaPayment(data));

// 2. Follow-up (Using unwrap)
// Use this if the UI needs to change based on the result.
dispatch(processMpesaPayment(data))
  .unwrap()
  .then(() => {
    setPhoneNumber(""); // Reset local UI state
    navigate("/receipt"); // Move to next screen
  });
```
```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideMpesaModal, showSpinner, hideSpinner, showNotification } from '../features/uiSlice';
import { selectModals } from '../features/uiSlice';
import { processMpesaPayment } from '../features/cartSlice';

const MpesaModal = () => {
  const dispatch = useDispatch();
  const { mpesa: isOpen } = useSelector(selectModals);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    amount: '',
  });
  
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    dispatch(hideMpesaModal());
    setFormData({ phoneNumber: '', amount: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^2547\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid M-Pesa number (2547XXXXXXXX)';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      dispatch(showSpinner({ message: 'Processing M-Pesa payment...' }));
      
      const paymentData = {
        phone_number: formData.phoneNumber,
        amount: parseFloat(formData.amount),
        payment_method: 'M-Pesa'
      };

      // Dispatch the payment processing action
      await dispatch(processMpesaPayment(paymentData)).unwrap();
      
      dispatch(hideSpinner());
      dispatch(showNotification({
        type: 'success',
        title: 'Payment Initiated',
        message: 'Please check your phone for the M-Pesa prompt and enter your PIN.',
      }));
      
      handleClose();
    } catch (error) {
      dispatch(hideSpinner());
      dispatch(showNotification({
        type: 'error',
        title: 'Payment Failed',
        message: error.message || 'Failed to process M-Pesa payment. Please try again.',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">M-Pesa Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="2547XXXXXXXX"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (KES)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* M-Pesa Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">How to pay:</h3>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Click "Process Payment" below</li>
              <li>Check your phone for M-Pesa prompt</li>
              <li>Enter your M-Pesa PIN to complete payment</li>
              <li>Wait for confirmation message</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MpesaModal;
```
# Writing Thunks
A thunk functions accepts two arguments.  
1. `dispatch`
2. `getState`    

Thunk functions are not directly called by app. code, they are paseed to `store.dispatch()`  
```jsx
const thunkFunction = (dispatch, getState) => {
    //
}
store.dispatch()
```
A thunk function may contain any arbitrary logic, sync or async, and can call dispatch or getState at any time.   
In the same way that Redux code normally uses action creators to generate action objects for dispatching instead of writing action objects by hand, we normally use thunk action creators to generate the thunk functions that are dispatched.   
A thunk action creator is a function that may have some arguments, and returns a new thunk function. The thunk typically closes over any arguments passed to the action creator, so they can be used in the logic:  
 ```jsx
// fetchTodoById is the "thunk action creator"
export function fetchTodoById(todoId) {
  // fetchTodoByIdThunk is the "thunk function"
  return async function fetchTodoByIdThunk(dispatch, getState) {
    const response = await client.get(`/fakeApi/todo/${todoId}`)
    dispatch(todosLoaded(response.todos))
  }
}
 ```
Thunk functions and action creators can be written using either the function keyword or arrow functions - there's no meaningful difference here. The same fetchTodoById thunk could also be written using arrow functions, like this: 
```jsx
export const fetchTodoById = todoId => async dispatch => {
  const response = await client.get(`/fakeApi/todo/${todoId}`)
  dispatch(todosLoaded(response.todos))
}
```
In either case, the thunk is dispatched by calling the action creator, in the same way as you'd dispatch any other Redux action:  
```jsx
function TodoComponent({ todoId }) {
  const dispatch = useDispatch()

  const onFetchClicked = () => {
    // Calls the thunk action creator, and passes the thunk function to dispatch
    dispatch(fetchTodoById(todoId))
  }
}
```
# Why Use Thunks?
Thunks allow us to write additional Redux-related logic separate from a UI layer.  
This logic can include side effects, such as async requests or generating random values, as well as logic that requires dispatching multiple actions or access to the Redux store state.  
`Redux reducers must not contain side effects`, but real applications require logic that has side effects.  
In a sense, a thunk is a loophole where `you can write any code that needs to interact with the Redux store, ahead of time, without needing to know which Redux store will be used`. This keeps the logic from being bound to any specific Redux store instance and keeps it reusable  
### Thunk Use Cases
Because thunks are a general-purpose tool that can contain arbitrary logic, they can be used for a wide variety of purposes. The most common use cases are:  

- Moving complex logic out of components
- Making async requests or other async logic
- Writing logic that needs to dispatch multiple actions in a row or over time
- Writing logic that needs access to getState to make decisions or include other state values in an action.   

Thunks are "one-shot" functions, with no sense of a lifecycle.  
They also cannot see other dispatched actions.  
So, they should not generally be used for initializing persistent connections like websockets, and you can't use them to respond to other actions.  
*Thunks are best used for complex synchronous logic, and simple to moderate async logic such as making a standard AJAX request and dispatching actions based on the request results.*  
# Redux Thunk MiddleWare
The Redux Toolkit **configureStore** API `automatically adds the thunk middleware during store creation, so it should typically be available with no extra configuration needed`.  
If you need to add the thunk middleware to a store manually, that can be done by passing the thunk middleware to applyMiddleware() as part of the setup process.  
Redux middleware are all written as a series of 3 nested functions:  
- The outer function receives a "store API" object with {dispatch, getState}
- The middle function receives the next middleware in the chain (or the actual store.dispatch method)
- The inner function will be called with each action as it's passed through the middleware chain

It's important to note that middleware can be used to allow passing values that are not action objects into `store.dispatch()`, as long as the middleware intercepts those values and does not let them reach the reducers.  
Redux thunk middleware implementation, annotated.  
```jsx
// standard middleware definition, with 3 nested functions:
// 1) Accepts `{dispatch, getState}`
// 2) Accepts `next`
// 3) Accepts `action`
const thunkMiddleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // If the "action" is actually a function instead...
    if (typeof action === 'function') {
      // then call the function and pass `dispatch` and `getState` as arguments
      return action(dispatch, getState)
    }

    // Otherwise, it's a normal action - send it onwards
    return next(action)
  }
```
In other words:  
- If you pass a function into `dispatch`, the thunk middleware sees that it's a function instead of an action object, intercepts it, and calls that function with `(dispatch, getState)` as its arguments
- If it's a normal action object (or anything else), it's forwarded to the next middleware in the chain

### Injecting Config Values Into Thunks
The thunk middleware does have one customization option.   
You can create a custom instance of the thunk middleware at setup time, and inject an "extra argument" into the middleware.  
The middleware will then inject that extra value as the third argument of every thunk function.  
This is most commonly used for injecting an API service layer into thunk functions, so that they don't have hardcoded dependencies on the API methods:  
```jsx
import { withExtraArgument } from 'redux-thunk'

const serviceApi = createServiceApi('/some/url')

const thunkMiddlewareWithArg = withExtraArgument({ serviceApi }) 
```
Redux Toolkit's `configureStore` supports this as `part of its middleware customization` in **getDefaultMiddleware**:  
```jsx
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { serviceApi }
      }
    })
})
```
There can only be one extra argument value. If you need to pass in multiple values, pass in an object containing those.  
The thunk function will then receive that extra value as its third argument:  
```jsx
export const fetchTodoById =
  todoId => async (dispatch, getState, extraArgument) => {
    // In this example, the extra arg is an object with an API service inside
    const { serviceApi } = extraArgument
    const response = await serviceApi.getTodo(todoId)
    dispatch(todosLoaded(response.todos))
  }
```
# Thunk Usage Patterns
#### Dispatching Actions  
Thunks have access to the `dispatch` method. This can be used to dispatch actions, or even other thunks. This can be useful for dispatching multiple actions in a row (`although this is a pattern that should be minimized`), or orchestrating complex logic that needs to dispatch at multiple points in the process.    
```jsx
// An example of a thunk dispatching other action creators,
// which may or may not be thunks themselves. No async code, just
// orchestration of higher-level synchronous logic.
function complexSynchronousThunk(someValue) {
  return (dispatch, getState) => {
    dispatch(someBasicActionCreator(someValue))
    dispatch(someThunkActionCreator())
  }
}
```
#### Accessing State
Unlike components, thunks also have access to `getState`. This can be called at any time to retrieve the current root Redux state value. This can be useful for running conditional logic based on the current state. It's common to use selector functions when reading state inside of thunks rather than accessing nested state fields directly, but either approach is fine.  
```jsx
const MAX_TODOS = 5

function addTodosIfAllowed(todoText) {
  return (dispatch, getState) => {
    const state = getState()

    // Could also check `state.todos.length < MAX_TODOS`
    if (selectCanAddNewTodo(state, MAX_TODOS)) {
      dispatch(todoAdded(todoText))
    }
  }
}
```
It's preferable to put as much logic as possible in reducers, but it's fine for thunks to also have additional logic inside as well.  
Since the state is synchronously updated as soon as the reducers process an action, you can call `getState` after a dispatch to get the updated state.  
```jsx
function checkStateAfterDispatch() {
  return (dispatch, getState) => {
    const firstState = getState()
    dispatch(firstAction())

    const secondState = getState()

    if (secondState.someField != firstState.someField) {
      dispatch(secondAction())
    }
  }
}
```
One other reason to consider accessing state in a thunk is to fill out an action with additional info. Sometimes a slice reducer really needs to read a value that isn't in its own slice of state. A possible workaround to that is to dispatch a thunk, extract the needed values from state, and then dispatch a plain action containing the additional info.  
```jsx
// One solution to the "cross-slice state in reducers" problem:
// read the current state in a thunk, and include all the necessary
// data in the action
function crossSliceActionThunk() {
  return (dispatch, getState) => {
    const state = getState()
    // Read both slices out of state
    const { a, b } = state

    // Include data from both slices in the action
    dispatch(actionThatNeedsMoreData(a, b))
  }
}
```
#### Async Logic and Side Effects 
Thunks may contain async logic, as well as side effects such as updating `localStorage`. That logic may use `Promise` chaining such as `someResponsePromise.then()`, although the `async/await` syntax is usually preferable for readability.  
When making async requests, it's standard to dispatch actions before and after a request to help track loading state.   
Typically, a "pending" action before the request and a loading state enum is marked as "in progress".  
If the request succeeds, a "fulfilled" action is dispatched with the result data, or a "rejected" action is dispatched containing the error info.  
Error handling here can be trickier than most people think. If you chain `resPromise.then(dispatchFulfilled).catch(dispatchRejected)` together, you may end up dispatching a "rejected" action if some non-network error occurs during the process of handling the "fulfilled" action.  
It's better to use the second argument of `.then()` to ensure you only handle errors related to the request itself:
```jsx
function fetchData(someValue) {
  return (dispatch, getState) => {
    dispatch(requestStarted())

    myAjaxLib.post('/someEndpoint', { data: someValue }).then(
      response => dispatch(requestSucceeded(response.data)),
      error => dispatch(requestFailed(error.message))
    )
  }
}
```
With `async/await`, this can be even trickier, because of how `try/catch` logic is usually organized. In order to ensure that the `catch` block only handles errors from the network level, it may be necessary to reorganize the logic so that the thunk returns early if there's an error, and "fulfilled" action only happens at the end:  
```jsx
function fetchData(someValue) {
  return async (dispatch, getState) => {
    dispatch(requestStarted())

    // Have to declare the response variable outside the try block
    let response

    try {
      response = await myAjaxLib.post('/someEndpoint', { data: someValue })
    } catch (error) {
      // Ensure we only catch network errors
      dispatch(requestFailed(error.message))
      // Bail out early on failure
      return
    }

    // We now have the result and there's no error. Dispatch "fulfilled".
    dispatch(requestSucceeded(response.data))
  }
}
```
Note that this issue isn't exclusive to Redux or thunks - it can apply even if you're only working with React component state as well, or any other logic that requires additional processing of a successful result.  
This pattern is admittedly awkward to write and read. In most cases you can probably get away with a more typical `try/catch` pattern where the request and the `dispatch(requestSucceeded())` are back-to-back. It's still worth knowing that this can be an issue.    
#### Returning Values From Thunks 
By default, `store.dispatch(action)` returns the actual action object.  
Middleware can override the return value being passed back from dispatch, and substitute whatever other value they want to return. For example, a middleware could choose to always return 42 instead:  
```jsx
const return42Middleware = storeAPI => next => action => {
  const originalReturnValue = next(action)
  return 42
}

// later
const result = dispatch(anyAction())
console.log(result) // 42
```
The thunk middleware does this, by returning whatever the called thunk function returns.  
The most common use case for this is returning a promise from a thunk. This allows the code that dispatched the thunk to wait on the promise to know that the thunk's async work is complete. This is often used by components to coordinate additional work:  
```jsx
const onAddTodoClicked = async () => {
  await dispatch(saveTodo(todoText))
  setTodoText('')
}
```
There's also a neat trick you can do with this: you can repurpose a thunk as a way to make a one-time selection from the Redux state when you only have access to `dispatch`.  
Since dispatching a thunk returns the thunk return value, you could write a thunk that accepts a selector, and immediately calls the selector with the state and returns the result.   
This can be useful in a React component, where you have access to `dispatch` but not `getState`.  
```jsx
// In your Redux slices:
const getSelectedData = selector => (dispatch, getState) => {
  return selector(getState())
}

// in a component
const onClick = () => {
  const todos = dispatch(getSelectedData(selectTodos))
  // do more logic with this data
}
```
```jsx
// In your Redux slices:
const getSelectedData = selector => (dispatch, getState) => {
  return selector(getState())
}

// in a component
const onClick = () => {
  const todos = dispatch(getSelectedData(selectTodos))
  // do more logic with this data
}
```