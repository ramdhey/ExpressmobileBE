const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes/index");
require("dotenv").config();
const sequelize = require("./config/db");
const http = require("http");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/", routes);

sequelize
  .sync({ alter: true }) // Set to true if you want to drop and recreate tables, but be careful with this in production
  .then(() => {
    console.log("Database & tables synced!");

    // Server and Socket.io setup
    const server = http.createServer(app);

    // Port listening
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
