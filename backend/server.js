const express = require("express");
const app = express();
app.use(express.json());
app.get("/", (req,res) => {
    res.send("Plant Cupid backend is running 🌱");
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});