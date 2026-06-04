import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Recipes from "./pages/Recipes.jsx";
import RecipeDetails from "./pages/RecipeDetails.jsx";
import MyRecipes from "./pages/MyRecipes.jsx";
import Admin from "./pages/Admin.jsx";
import CreateRecipe from "./pages/CreateRecipe.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "recipes",
        element: <Recipes />,
      },
      {
        path: "recipes/:recipeId",
        element: <RecipeDetails />,
      },
      {
        path: "my-recipes",
        element: <MyRecipes />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "create-recipe",
        element: <CreateRecipe />,
      },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
