const { registerNewRouteInDB } = require("../models/adminModel")
const { getRouteDetailFromDB,add } = require("../models/commonModel")
const { responseBody } = require("../utils/commonUtils")

const addRoute = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { routeShortName,routeName } = req.body
            getRouteDetailFromDB(undefined,routeShortName).then(response => {
                if(response.code == 404 ){
                   registerNewRouteInDB(routeName,routeShortName).then(response=>{
                    if(response.code == 200 && response.success == true){
                        return resolve(res.send(responseBody(response.success, response.message,response.data, response.code)))
                    } else {
                        throw response
                    }
                   }).catch(response=>{
                    console.log(response)
                    if(response.code ==500){
                        return resolve(res.send(responseBody(false, `Failed to register route details`, {}, 500)))

                    } else {
                        return resolve(res.send(responseBody(false, response.message, {}, response.code)))

                    }
                   })

                } else if(response.code == 302) {
                    return resolve(res.send(responseBody(false, `Route is already registered`, {}, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to fetch route details`, {}, 500)))

                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))

                }
            })

        } catch (err) {
            console.log(err)
            return resolve(res.send(responseBody(false, `Internal Server Error`, {}, 500)))

        }
    })
}

const getRouteDetails = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { routeId,routeShortName } = req.query
            getRouteDetailFromDB(routeId,routeShortName).then(response => {
                if(response.code ==302 || response.code == 404 ){
                    return resolve(res.send(responseBody(response.success, response.message,response.data, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to fetch route details`, {}, 500)))

                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))

                }
            })

        } catch (err) {
            console.log(err)
            return resolve(res.send(responseBody(false, `Internal Server Error`, {}, 500)))

        }
    })
}

module.exports = {
    getRouteDetails,addRoute
}