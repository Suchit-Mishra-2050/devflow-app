import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import userRoute from "./routes/userRoute.js";
import organizationRoute from "./routes/organizationRoute.js";
import projectRoute from "./routes/projectRoute.js";
import taskRoute from "./routes/taskRoute.js";
import taskActivityRoute from "./routes/taskActivityRoute.js";

const app = express();
dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use("/api/user", userRoute);
app.use("/api/organization", organizationRoute);
app.use("/api/project", projectRoute);
app.use("/api/task", taskRoute);
app.use("/api/task-activity", taskActivityRoute);

connectDB();

app.post("/test", (req, res) => {
  res.send("app is working");
});

app.get("/", (req, res) => {
  res.send("now we are at home");
});

app.listen(port, () => {
  console.log(`app is listening the port ${port}`);
});
