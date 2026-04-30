There are three modes of React Router with each having a specific window for the amount of control over one's data. This is imminent especially when moving from `declarative` to `Data` Framework.   
So picking your mode is based on how much control and help you want from React Router.  
# React Router Modes
- Framework
- Data
- Declarative

### Declarative
Declarative mode enables basic routing features like matching URLs to components, navigating around app, and providing active states with APIs like `<Link>`, `useNavigate` and `useLocation`.  
```jsx
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

```
### Data
By moving route configuration outside of React rendering, Data Mode allows data loading, actions, pending states and more with APIs like `loader`, `action` and `useFetcher`.  
```jsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    loader: loadRootData,
  },
]);

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />,
);
```
### Framework
Wraps Data Mode with a Vite plugin to add the full React Router experience with:  
- type-safe `href`
- type-safe Route Module API
- intelligent code splitting
- SPA, SSR, and static rendering strategies
- and more 
```jsx
// routes.ts
import { index, route } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("products/:pid", "./product.tsx"),
];

```
You'll then have access to the Route Module API with type-safe params, loaderData, code splitting, SPA/SSR/SSG strategies, and more.   
```jsx
// product.tsx
import { Route } from "./+types/product.tsx";

export async function loader({ params }: Route.LoaderArgs) {
  let product = await getProduct(params.pid);
  return { product };
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  return <div>{loaderData.product.name}</div>;
}
```
##### Side Quests
```
Feature	            |       Declarative	        |    Data	              |   Framework
____________________|___________________________|_________________________|________________________________________
Main API	        |        `<BrowserRouter>`	|    createBrowserRouter  |	     Vite Plugin + app/routes.ts
Supports Loaders?	|            No	            |        Yes	          |          Yes
Routing Style	    |        JSX Components	    |    Objects/Code	      |    File-based or Objects
Best For	        |        Beginners	        |    Standard SPAs	      |    Full-stack /
```
```
Context                |             How to access Redux                                                          |
_______________________|__________________________________________________________________________________________|
Inside a Component     |             Use useDispatch() or useSelector()                                           |
Inside a Loader        |             Import the store object directly and use store.dispatch() or store.getState()|
```
# DATA MODE
## Installation
```
npm i react-router
```
## Steps
- **Create a router and pass it to `RouterProvider`:** 
```jsx
import React from "react"
import ReactDOM from "react-dom/client"
import {createBrowserRouter} from "react-router"
import {RouterProvider} from "react-router/dom"

const router = createBrowserRouter([
    {path: "/", 
     element: <div>Hello World!</div>
    }
    const root = document.getElementById("root")

    ReactDOM.createRoot(root).render(
        <RouterProvider router={router}/>
    )
])
```
- 