const { addUserInDB, getUserDataFromDB, searchFlightsFromDB, bookFlightInDB, getActiveBookingsFromDB, getFlightDataFromDB } = require("../models/userModel")
const { checkForEmailExistenceInBothAdminAndUsers } = require("../models/commonModel")
const { responseBody } = require("../utils/commonUtils")

const addUser = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { email, password } = req.headers
            const { name } = req.body
            checkForEmailExistenceInBothAdminAndUsers(email).then((response) => {
                console.log(response,1)
                if (response.success == true && response.code == 404) {
                    addUserInDB(email, name, password).then(response => {
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

const searchFlights = (req,res)=>{
    return new Promise(async (resolve, reject) => {
        try {
            let { source,destination,pageNo,date } = req.query
            if(source == undefined || source == ""){
                return resolve(res.send(responseBody(false, "Please provide source location",{}, 400)))
            }
            if(destination == undefined || destination == ""){
                return resolve(res.send(responseBody(false, "Please provide destination location",{}, 400)))

            }
            if(pageNo == undefined || pageNo == "" || pageNo==0){
                pageNo = 1
            } else {
                pageNo = Number(pageNo)
            }
            if(date == undefined || date ==""){
                return resolve(res.send(responseBody(false, "Please provide date",{}, 400)))

            }
            searchFlightsFromDB(source,destination,date,pageNo).then(response => {
                if( response.code == 302 || response.code == 404){
                    return resolve(res.send(responseBody(true, response.message,response.data, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to search flights`, {}, 500)))

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
const loginUser = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { email, password } = req.headers

            getUserDataFromDB(email, password).then(response => {
                
                if(response.success == true && response.code ==302){
                    req.session.userId = response.data.result.id
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

const bookFlight = (req,res)=>{
    return new Promise(async (resolve, reject) => {
        try {
            let { flightId,totalTickets,passengers,seatsForBooking } = req.body
            const userId = req.session.userId
            bookFlightInDB(userId,flightId,totalTickets,passengers,seatsForBooking).then(response => {
                if( response.code == 200 && response.success == true){
                    return resolve(res.send(responseBody(true, response.message,response.data, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to perform booking`, {}, 500)))

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

const getActiveBookings = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { pageNo } = req.query
            const userId = req.session.userId
            if(pageNo == undefined || pageNo == "" || pageNo==0){
                pageNo = 1
            } else {
                pageNo = Number(pageNo)
            }
            getActiveBookingsFromDB(userId,pageNo).then(response => {
                if( response.code == 302 || response.code == 404){
                    return resolve(res.send(responseBody(true, response.message,response.data, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to fetch active bookings`, {}, 500)))

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

const getFlightData = (req,res)=>{
    return new Promise(async (resolve, reject) => {
        try {
            let { flightID } = req.query
            if(flightID == undefined || flightID == "" || flightID==0){
                return resolve(res.send(responseBody(true, "Please specify a valid flight id",{}, 400)))
            }
            getFlightDataFromDB(flightID).then(response => {
                if( response.code == 302 || response.code == 404){
                    return resolve(res.send(responseBody(true, response.message,response.data, response.code)))

                } else if(response.code == 500) {
                    throw response
                } else {
                    return resolve(res.send(responseBody(false, response.message, {}, response.code)))
                }
            }).catch(response=>{
                console.log(response)
                if(response.code == 500){
                    return resolve(res.send(responseBody(false, `Failed to fetch flight data`, {}, 500)))

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
    addUser,loginUser,searchFlights,bookFlight,getActiveBookings,getFlightData
}