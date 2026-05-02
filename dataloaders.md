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
## Memory Lane
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
The fully-fledged versiom of it would be something like: 
```jsx
createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
        ],
      },
      {
        path: "concerts",
        children: [
          { index: true, Component: ConcertsHome },
          { path: ":city", Component: ConcertsCity },
          { path: "trending", Component: ConcertsTrending },
        ],
      },
    ],
  },
]);

```
Route objects define the behaviour of a route beyond just the path and component, like data loading and actions.  
A quick example: 
```jsx
import {createBrowserRouter, useLoaderData} from "react-router"

createBrowserRouter([
    {
      path: "/teams/:teamId", 
      loader: async ({params}) => {
        let team = await fetchTeam(params.teamId);
        return {name: team.name}
      }, 
      Component: Team
    }
])

function Team () {
  let data = useLoaderData()
    return <h1>{data.name}</h1> 
}
```
- Routes can be nested inside a parent routes through `children`.  
```jsx
createBrowserRouter([
  {
    path: "/dashboard",
    Component: Dashboard,
    children: [
      { index: true, Component: Home },
      { path: "settings", Component: Settings },
    ],
  },
]);

```
The path of the parent is automatically included in the child, so this config creates both "/dashboard" and "/dashboard/settings" URLs.    
Child routes are rendered through the `<Outlet/>` in the parent route.    
### Layout Routes
Omitting the `path` in a route creates new `Nested Routes` for its children without adding any segments to the URL.  
```jsx
createBrowserRouter([
  {
    // no path on this parent route, just the component
    Component: MarketingLayout,
    children: [
      { index: true, Component: Home },
      { path: "contact", Component: Contact },
    ],
  },

  {
    path: "projects",
    children: [
      { index: true, Component: ProjectsHome },
      {
        // again, no path, just a component for the layout
        Component: ProjectLayout,
        children: [
          { path: ":pid", Component: Project },
          { path: ":pid/edit", Component: EditProject },
        ],
      },
    ],
  },
]);

```
- `Home` and `Contact` will be rendered into the `MarketingLayout` outlet  
- `Project` and `EditProject` will be rendered into the `ProjectLayout` outlet while `ProjectsHome` will not.   

### Index Routes 
Defined by setting `index: true` on a route object without a path.  
Index routes render into their parent's Outlet at their parent's URL( like a default child route.)  
```jsx
import { createBrowserRouter } from "react-router";

createBrowserRouter([
  // renders at "/"
  { index: true, Component: Home },
  {
    Component: Dashboard,
    path: "/dashboard",
    children: [
      // renders at "/dashboard"
      { index: true, Component: DashboardHome },
      { path: "settings", Component: DashboardSettings },
    ],
  },
]);

```
**Note that index routes can't have children.**    
### Prefix Route
A route with just a path and no component creates a group of routes with a path prefix.  
```jsx
createBrowserRouter([
  {
    // no component, just a path
    path: "/projects",
    children: [
      { index: true, Component: ProjectsHome },
      { path: ":pid", Component: Project },
      { path: ":pid/edit", Component: EditProject },
    ],
  },
]);

```
This creates the routes `/projects`, `/projects/:pid`, and `/projects/:pid/edit` without introducing a layout component.  
### Dynamic Segments
If a path segment starts with `:` then it becomes a "dynamic segment".  
When the route matches the URL, the dynamic segment will be parsed from the URL and provided as `params` to other router APIs.
```jsx
{
  path: "teams/:teamId",
  loader: async ({ params }) => {
    // params are available in loaders/actions
    let team = await fetchTeam(params.teamId);
    return { name: team.name };
  },
  Component: Team,
}

```
```jsx
import { useParams } from "react-router";

function Team() {
  // params are available in components through useParams
  let params = useParams();
  // ...
}

```
## Route Object
The objects passed to `createBrowserRouter` are called Route Objects.  
```jsx
 {
    path: "/",
    Component: App,
  },
```
Route modules are the foundation of React Router's data features, they define:  
- data loading
- actions
- revalidation
- error boundaries
- and more

### middleware
Route middleware runs sequentially before and after navigations.  
This gives you a singular place to do things like logging and authentication.  
The `next` function continues down the chain, and on the leaf route the `next` function executes the loaders/actions for the navigation.  
```jsx
createBrowserRouter([
  {
    path: "/",
    middleware: [loggingMiddleware],
    loader: rootLoader,
    Component: Root,
    children: [{
      path: 'auth',
      middleware: [authMiddleware],
      loader: authLoader,
      Component: Auth,
      children: [...]
    }]
  },
]);

async function loggingMiddleware({ request }, next) {
  let url = new URL(request.url);
  console.log(`Starting navigation: ${url.pathname}${url.search}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation completed in ${duration}ms`);
}

const userContext = createContext<User>();

async function authMiddleware ({ context }) {
  const userId = getUserId();

  if (!userId) {
    throw redirect("/login");
  }

  context.set(userContext, await getUserById(userId));
};

```
### action
Route actions allow server-side data mutations with automatic revalidation of all loader data on the page when called from `<Form>`, `useFetcher`, and `useSubmit`.    
```jsx
import {
  createBrowserRouter,
  useLoaderData,
  useActionData,
  Form,
} from "react-router";
import { TodoList } from "~/components/TodoList";

createBrowserRouter([
  {
    path: "/items",
    action: action,
    loader: loader,
    Component: Items,
  },
]);

async function action({ request }) {
  const data = await request.formData();
  const todo = await fakeDb.addItem({
    title: data.get("title"),
  });
  return { ok: true };
}

// this data will be revalidated after the action completes...
async function loader() {
  const items = await fakeDb.getItems();
  return { items };
}

// ...so that the list here is updated automatically
export default function Items() {
  let data = useLoaderData();
  return (
    <div>
      <List items={data.items} />
      <Form method="post" navigate={false}>
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}

```
### lazy 
Most properties can be lazily imported to reduce the initial bundle size.  
```jsx
createBrowserRouter([
  {
    path: "/app",
    lazy: async () => {
      // load component and loader in parallel before rendering
      const [Component, loader] = await Promise.all([
        import("./app"),
        import("./app-loader"),
      ]);
      return { Component, loader };
    },
  },
]);

```
- shouldRevalidate
- Component
- loader
## Data Loading
Data is provided to route components from route loaders.  
```jsx
createBrowserRouter([
  {
    path: "/",
    loader: async () => {
      // return data from here
      return { records: await getSomeRecords() };
    },
    Component: MyRoute,
  },
]);

```
The data is accessed by the route components with `useLoaderData`.  
```jsx
import {useLoaderData} from "react-router"

function MyRoute () {
  const {records} = useLoaderData()

  return <div>{records.length}</div>;
}
```
As the user navigates between routes, the loaders are called before the route component is rendered.  
## Actions
Data mutations are done through Route actions defined on the `action` property of a route object.  
When the action completes, all loader data on the page is revalidated to keep your UI in sync with the data without writing any code to do it.  
```jsx
import { createBrowserRouter } from "react-router";
import { someApi } from "./api";

let router = createBrowserRouter([
  {
    path: "/projects/:projectId",
    Component: Project,
    action: async ({ request }) => {
      let formData = await request.formData();
      let title = formData.get("title");
      let project = await someApi.updateProject({ title });
      return project;
    },
  },
]);
```
### Calling Actions
Actions are called declaratively through `<Form>` and imperatively through `useSubmit`(or `fetcher.Form` and `fetcher.submit`) by referencing the route's path and a "post" method.   
#### Calling actions with a Form
```jsx
import { Form } from "react-router";

function SomeComponent() {
  return (
    <Form action="/projects/123" method="post">
      <input type="text" name="title" />
      <button type="submit">Submit</button>
    </Form>
  );
}

```
This will cause a navigation and a new entry will be added to the browser history.  
#### Calling actions with useSubmit
Imperative. 
```jsx
import { useCallback } from "react";
import { useSubmit } from "react-router";
import { useFakeTimer } from "fake-lib";

function useQuizTimer() {
  let submit = useSubmit();

  let cb = useCallback(() => {
    submit(
      { quizTimedOut: true },
      { action: "/end-quiz", method: "post" },
    );
  }, []);

  let tenMinutes = 10 * 60 * 1000;
  useFakeTimer(tenMinutes, cb);
}
```
#### Calling actions with a fetcher
Fetchers allow you to submit data to actions (and loaders) without causing a navigation (no new entries in the browser history).  
```jsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/update-task/123">
      <input type="text" name="title" />
      <button type="submit">
        {busy ? "Saving..." : "Save"}
      </button>
    </fetcher.Form>
  );
}
```
They also have the imperative `submit` method.  
```jsx
fetcher.submit(
  { title: "New Title" },
  { action: "/update-task/123", method: "post" },
);
```
### Accessing Action Data
Actions can return data available through `useActionData` in the route component or `fetcher.data` when using a fetcher.  
```jsx
function Project() {
  let actionData = useActionData();
  return (
    <div>
      <h1>Project</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Submit</button>
      </Form>
      {actionData ? (
        <p>{actionData.title} updated</p>
      ) : null}
    </div>
  );
}
```
# Redux Toolkit and React Router's Data API 
- **The Router(Loaders/Actions)** handles the triggers and network requests.  
- **Redux** handles the persistence and cross-component state.  

## READ: Syncing Loaders to Redux
The loader fetches the data and "pushes" it into Redux before the page even loads.   
```jsx
// routes/ProductListLoader.js
import {store} from "../store"
import {setProducts} from "../slices/productSlice"
export const productSliceLoader = async () => {
  const response = await fetch("/api/products")

  const data = await response.json()
  // SYNC: Dispatch to Redux so the whole app knows the list is loaded  
  store.dispatch(setProducts(data))
  return data   // Also return it for local useLoaderData()
}
```
## CREATE/UPDATE/DELETE: Using Actions
For mutations, you use React Router Actions.  
These replace traditional `handleSubmit` functions. When an action completes, React Router automatically `re-validates` (re-runs) all active loaders, ensuring your Redux state stays fresh without manual refreshing.  
```jsx
// routes/EditProductAction.js
import { redirect } from 'react-router-dom';
import { store } from '../store';
import { updateProductInState } from '../slices/productSlice';

export const editProductAction = async ({ request, params }) => {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const response = await fetch(`/api/products/${params.id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (response.ok) {
    const updatedProduct = await response.json();
    
    // SYNC: Update the local store immediately
    store.dispatch(updateProductInState(updatedProduct));
    
    return redirect('/products');
  }
  return { error: "Failed to update" };
};
```
## The CRUD Componet(The UI)
In your component, you use the `<Form>` component provided by React Router. It automatically triggers the `action` defined in your route.  
```jsx
import { Form, useNavigation } from 'react-router-dom';

export function EditProduct() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <input name="title" defaultValue="Old Name" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Update Product"}
      </button>
    </Form>
  );
}
```
```
______________________________________________________________________________________________________________________
Operation         |              Router Feature   |      Redux Action      |         Result                           |
------------------|-------------------------------|------------------------|------------------------------------------|
Create            |              action (POST)    |     addItem            |         Item added; list re-validated.   |
Read              |              loader (GET)     |     setItems           |         Data in store before render.     |
Updateaction      |              (PUT)            |     updateItem         |         State updated; redirect to list. |
Delete            |              action (DELETE)  |     removeItem         |         Item removed; list re-fetched.   |
------------------|-------------------------------|------------------------|------------------------------------------|
```
## The "Gotcha": The Hook Rule.  
The only thing that causes confusion is that you cannot use Redux hooks (like `useDispatch` or `useSelector`) inside a loader. Hooks only work inside React component.  
```
Context               |   How to access Redux                                                             |
----------------------|--------------------------------------------------------------------------------   |
Inside a Component    |   Use useDispatch() or useSelector()                                              |
Inside a Loader       |   Import the store object directly and use store.dispatch() or store.getState()   |
```
### A sophisticated example
The Redux slice with an action.  
```jsx
// features/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, status: 'idle' },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
```
You need to export the `store` itself for the loader(which is a JS function) can access it without hooks.   
```jsx
//store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
```
Where the magic happens: 
```jsx
// routes/root.jsx
import { store } from '../app/store';
import { setUser } from '../features/user/userSlice';

export const userLoader = async ({ params }) => {
  // 1. Fetch the data
  const response = await fetch(`/api/user/${params.id}`);
  const userData = await response.json();

  // 2. Sync with Redux: Dispatch the action directly to the store
  store.dispatch(setUser(userData));

  // 3. Return data for useLoaderData()
  return userData;
};
```
The component can then get the data from either source. Usually you use `useLoaderData` for the initial render and `useSelector` if you need data to stay reactive to global changes.  
```jsx
// pages/UserProfile.jsx
import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UserProfile() {
  // This is the data fresh from the loader
  const loaderData = useLoaderData();
  
  // This is the same data, now living in global state
  const reduxUser = useSelector((state) => state.user.data);

  return (
    <div>
      <h1>{reduxUser.name}'s Profile</h1>
      <p>Email: {loaderData.email}</p>
    </div>
  );
}
```
loaders is only good for GET requests, this is mainly because a `loader` is triggered by a `URL change` or `revalidation`.    
You wouldn't want loader to CREATE, UPDATE or DELETE an item, when the page refreshes, right ? That is costly and unnecessary.   
`Actions` are the best for these scenarios with the "secret sauce" being **The Revalidation Power** i.e when an action finishes, React Router automatically **re-runs all the active loaders on the page**.    
## Fetching a Single Piece of Data
```jsx
// features/petSlice.js
import { createSlice } from '@reduxjs/toolkit';

const petSlice = createSlice({
  name: 'pets',
  initialState: { currentPet: null },
  reducers: {
    setCurrentPet: (state, action) => {
      state.currentPet = action.payload;
    },
  },
});

export const { setCurrentPet } = petSlice.actions;
export default petSlice.reducer;
```
```jsx
// routes/petLoader.js
import { store } from '../app/store';
import { setCurrentPet } from '../features/pets/petSlice';

export const petDetailLoader = async ({ params }) => {
  // params.id comes directly from the URL path defined in the router
  const response = await fetch(`https://api.vetty.com/pets/${params.id}`);
  
  if (!response.ok) throw new Response("Pet Not Found", { status: 404 });

  const petData = await response.json();

  // Sync with Redux: Now the Navbar or other components can see this pet's info
  store.dispatch(setCurrentPet(petData));

  return petData;
};
```
```jsx
// App.js
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PetDetail from './pages/PetDetail';
import { petDetailLoader } from './routes/petLoader';

const router = createBrowserRouter([
  {
    path: "/pets/:id",
    element: <PetDetail />,
    loader: petDetailLoader, // <--- Loader is attached here
    errorElement: <p>Oops! Pet not found.</p>
  }
]);
```
```jsx
// pages/PetDetail.jsx
import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PetDetail() {
  // Option A: Get data from Loader (Fresh & Local)
  const pet = useLoaderData();

  // Option B: Get data from Redux (Global)
  const petFromStore = useSelector((state) => state.pets.currentPet);

  return (
    <div className="pet-card">
      <h1>{pet.name}</h1>
      <img src={pet.image} alt={pet.name} />
      <p>{pet.description}</p>
    </div>
  );
}
```
