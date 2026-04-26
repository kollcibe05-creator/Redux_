***control Flow** refers to the order in which statements are executed in a program.  
By default, JS runs code from top to bottom and left to right.  
JS functions are executed in the sequence they are called. Not in the sequence they were defined.  
Some of the async methods are: 
- `setTimeout()`
- `callbacks`

#### Promises
Many callbacks become hard to read and maintain.  
```js
step1(function(r1) {
  step2(r1, function(r2) {
    step3(r2, function(r3) {
      console.log(r3);
    });
  });
});
```
This results to `callback hell`.  
Promises lets one write the same logic in a cleaner way.  
A Promise acts as a placeholder for a value that will be available at some point in the future, allowing you to handle asynchronous code in a cleaner way than traditional callbacks.   
A promise can either be `pending`, `fulfilled` or `rejected`.

#### Creating a Promise
```js
let myPromise  = new Promise(function (resolves, reject) {
    //code 
    resolve(value)
    reject(value)
})
``` 
# How To Use a Promise
```js
myPromise.then(
    function (value) {/*Code if it works out*/}
    function (value) {/*Code if an error*/}
)
```
`then()` takes in two args, one callback function for `success` and another for `failure`.  
Both are optional, so one can add a callback function for success or failure only.  
