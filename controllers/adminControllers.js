const { addAdminInDB, getAdminDataFromDB, registerFlightDetailsInDB } = require("../models/adminModel")
const { checkForEmailExistenceInBothAdminAndUsers, getRouteDetailFromDB } = require("../models/commonModel")
const { responseBody } = require("../utils/commonUtils")

const addAdmin = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { email, password } = req.headers
            const { name } = req.body
            checkForEmailExistenceInBothAdminAndUsers(email).then((response) => {
                console.log(response,1)
                if (response.success == true && response.code == 404) {
                    addAdminInDB(email, name, password).then(response => {
                        console.log(response,2)

                        if(response.success == true && response.code ==200){
                            return resolve(res.send(responseBody(true, response.message,response.data, 200)))

                        } else if(response.code == 500) {
                            throw response
                        } else {
                            return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                        }
                    }).catch(response=>{
                        console.log(response)
                        if(response.code == 500){
                            return resolve(res.send(responseBody(false, `Failed to create account`, {}, 500)))

                        } else {
                            return resolve(res.send(responseBody(false, response.message, {}, response.code)))

                        }
                    })

                } else if (response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response => {
                console.log(response)
                if(response.code ==500){
                    return resolve(res.send(responseBody(false, `Failed to add account`, {}, 500)))

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
const loginAdmin = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { email, password } = req.headers

            getAdminDataFromDB(email, password).then(response => {
                
                if(response.success == true && response.code ==302){
                    req.session.adminId = response.data.result.id
                    return resolve(res.send(responseBody(true, `Successfully logged in`,{}, 200)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to login`, {}, 500)))

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
const registerNewFlight = (req,res)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const { airlineName,source,destination,date,time,totalSeats,perCandidateCharge } = req.body
            let sourceValidity = await getRouteDetailFromDB(undefined,source)
            let destinationValidity = await getRouteDetailFromDB(undefined,destination)

            if(sourceValidity.success == true && sourceValidity.code == 302 && destinationValidity.code == 302 && destinationValidity.success == true) {
                registerFlightDetailsInDB(airlineName,source,destination,date,time,totalSeats,perCandidateCharge).then(response => {

                    if(response.success == true && response.code ==200){
                        return resolve(res.send(responseBody(true, response.message,response.data, 200)))
    
                    } else if(response.code == 500) {
                        throw response
                    } else {
                        return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                    }
                }).catch(response=>{
                    console.log(response)
                    if(response.code == 500){
                        return resolve(res.send(responseBody(false, `Failed to add flight data`, {}, 500)))
    
                    } else {
                        return resolve(res.send(responseBody(false, response.message, {}, response.code)))
    
                    }
                })
            } else if(sourceValidity.code == 404){
                return resolve(res.send(responseBody(false, `Source location you provided is not found`, {}, 404)))

            } else if(destinationValidity.code ==404){
                return resolve(res.send(responseBody(false, `Destination location you provided is not found`, {}, 404)))

            } else {
                return resolve(res.send(responseBody(false, `Unable to check for source and destination validity`, {}, 500)))

            }
            

        } catch (err) {
            console.log(err)
            return resolve(res.send(responseBody(false, `Internal Server Error`, {}, 500)))

        }
    })
}
module.exports = {
    addAdmin,loginAdmin,registerNewFlight
}