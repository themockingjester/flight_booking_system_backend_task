const router = require('express').Router();
const {  getRouteDetails } = require("../controllers/commonControllers")
router.get('/details',  getRouteDetails)
module.exports = router