import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router as commentsRouter } from "./routes/comments.js";

// Create an instance of the express application
const app = express();
// Specify a port number for the server
const port = 5005;
// Start the server and listen to the port
// use middleware to parse json request bodies
app.use(express.json());
app.use(cors());
app.use("/comments", commentsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
