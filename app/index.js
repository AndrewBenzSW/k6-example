const express = require("express");
const app = express();
const port = 3000;

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

app.use(express.json());

// Simple Hello World
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Add two addends
app.get("/add/:addend1/:addend2", (req, res) => {
  res.send(
    (
      parseInt(req.params["addend1"], 10) + parseInt(req.params["addend2"], 10)
    ).toString()
  );
});

// Calculate the sum of the addends
app.post("/sum", (req, res) => {
  res.json({
    result: req.body.addends.reduce((sum, addend) => sum + addend, 0),
  });
});

app.get("/random", (req, res) => {
  res.send(getRandomIntInclusive(1, 10).toString());
});

app.get("/performance", async (req, res) => {
  const delay = getRandomIntInclusive(25, 250);
  await new Promise((res) => setTimeout(res, delay));
  res.send(delay.toString());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
