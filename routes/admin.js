const router = require('express').Router();
const { addAdmin, loginAdmin, registerNewFlight } = require("../controllers/adminControllers");
const { addRoute } = require('../controllers/commonControllers');
const { isAdminAuthorised } = require('../middlewares/adminMiddleware');
router.post('/addAdmin',  addAdmin)
router.post('/login',loginAdmin)
router.post('/addRoute',[isAdminAuthorised],addRoute)
router.post('/addNewFlight',[isAdminAuthorised],registerNewFlight)
module.exports = router