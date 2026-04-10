const express = require("express");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("CloudSentinel DevSecOps pipeline is running successfully.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
