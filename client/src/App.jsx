import React from 'react'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import index from './routes/index';
import chat from './routes/chat';
import call from './routes/call';
import Navbar from './components/Navbar';

const rootRoute = createRootRoute({
  component:()=>{
    return(
    <>
      <Navbar/>
      <Outlet/>
    </>
    )
  }
})

const indexRoute = createRoute({
  getParentRoute:()=>rootRoute,
  path: '/',
  component: index,
})

const chatRoute = createRoute({
  getParentRoute:()=>rootRoute,
  path:"/chat/",
  component:chat
})
const callRoute  = createRoute({
  getParentRoute:()=>rootRoute,
  path:"/call/",
  component:call
})
const routeTree = rootRoute.addChildren([indexRoute,chatRoute,callRoute]);
const router = createRouter({ routeTree });
const App = () => {
  return (
     <RouterProvider router={router} />
  )
}
export default App;
