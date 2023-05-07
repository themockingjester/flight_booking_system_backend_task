const { resultObject } = require("../utils/commonUtils")

function isAdminAuthorised(req, res, next) {
    console.log(req.session, 533)

    if (req.session.adminId) {
        next()
    } else {
        return res.status(200).send(resultObject(false, 'Failed: you are not authorized!', {}, 401))
    }

};

module.exports = {
    isAdminAuthorised
}