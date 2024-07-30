const { insert, get } = require("../controller/accountAbstractionUnity");

const router = require("express").Router();

router.post("/insert", insert);
router.post("/get", get);

module.exports = router;
