const { Router } = require("express");
const { getPlantImage } = require("../controllers/imageController");

const router = Router();

router.get("/", getPlantImage);

module.exports = router;