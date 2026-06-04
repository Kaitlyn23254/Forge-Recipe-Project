## Cookit

## Table of Contents

- [Project Description](#project-description)
- [Installation](#installation)
- [External Setup](#external-setup)
- [How to Use Project](#how-to-use-project)
- [Major Components and Features](#major-components-and-features)
- [Status of Features](#status-of-features)
- [Credits](#credits)

## Project Description

A web app that fetches and displays recipes from TheMealDB API and user-generated recipes. Users leave comments and ratings and ask a chatbot for help with recipe-related questions. An admin account will review user-submitted recipes.

This project is a React + Vite frontend with an Express and Firebase backend for displaying data from TheMealDB API.

## Installation

1. Clone the repository.
2. Install the backend dependencies and start the server:

	```bash
	cd backend
	npm install
    npm start
	```

3. In another terminal, install the frontend dependencies and start the server:

	```bash
	cd frontend
	npm install
    npm run dev
	```

4. Open the app in your browser [http://localhost:5173/](typically http://localhost:5173/).

## External Setup

We are using some external services such as the TheMealDB API and Firebase which require their own configuration before starting the servers.

- [TheMealDB API](https://www.themealdb.com/api.php)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Firebase](https://firebase.google.com/)

## How to Use Project

After both servers are running, open the site and use the navbar to browse the pages. You can sign in or create an account through **Login** to save recipes, post comments, or submit your own recipes on **Create Recipe**. Your saved and submitted recipes live under **My Recipes**; admins use **Admin** to review pending submissions before they go live.

## Major Components and Features

- Recipe Page
  - Displays both official recipes from TheMealDB and user-generated recipes that an admin account has approved.
  - Users can save recipes.
- Recipe Detail Page
  - Displays detailed information about a selected recipe.
  - Includes a section where users can leave comments and ratings.
  - Users can reply to comments and upvote replies.
  - Includes a chatbot to get help with an individual recipe (instructions, ingredient substitutions, general questions, etc.).
- My Recipes Page
  - View and edit the recipes you have created and saved.
  - Edit or delete recipes you have created.
- Create Recipe Page
  - See something you think our website is missing? Upload your own recipe!
- Admin Page (only visible to admin account)
  - Admins can verify and publish user-generated recipes.

## Status of Features
All the above major features have been fully implemented. We are still working on adding additional security to assigning admin roles.

## Credits

- Built with React, Vite, Express, Axios, Material UI, and React Router.
- Project author(s):
  - [Kaitlyn Wei](https://github.com/Kaitlyn23254)
  - [Sanaa Elattari](https://github.com/SanaaElattari)
  - [Mathias Kuchimpos](https://github.com/mkuch2)
  - [Crystal Low](https://github.com/lowwcrystal)
