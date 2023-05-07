const { GetPoolConnection } = require("../utils/databaseConnection")
const { resultObject } = require("../utils/commonUtils")
const addUserInDB = (email, name, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`INSERT INTO users (email,name,password) values ('${email}','${name}','${password}')`)

                        if (queryRes.rowCount > 0) {
                            // successfully inserted
                            await client.release()

                            return resolve(resultObject(true, `Successfully created account`, {}, 200))

                        } else {
                            await client.release()

                            return resolve(resultObject(false, `Failed to add acount`, {}, 500))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to add user account", { error: err }, 500))
        }
    })
}

const searchFlightsFromDB = (source,destination,date,pageNo)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const startTime = new Date(`${date} 00:00:00`).getTime()
                        const endTime = new Date(`${date} 23:59:59`).getTime()
                        const rowsPerPage = 25
                        const offset = (pageNo-1) * rowsPerPage
                        const queryRes = await client.query(`SELECT id,source,destination,time,airline_name FROM flights WHERE source='${source}' AND destination='${destination}' AND time>=${startTime} AND time<=${endTime} AND status=1 LIMIT 25 OFFSET ${offset}`)

                        if (queryRes.rows.length > 0) {
                            // successfully 
                            await client.release()

                            return resolve(resultObject(true, `Successfully fetched flights`, {result:queryRes.rows}, 302))

                        } else {
                            await client.release()

                            return resolve(resultObject(true, `No Flights Found`, {}, 404))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to fetch flight details", { error: err }, 500))
        }
    })
}
const getUserDataFromDB = (email,password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`)

                        if (queryRes.rows.length > 0) {
                            // successfully inserted
                            await client.release()

                            return resolve(resultObject(true, `Successfully fetched account details`, {result:queryRes.rows[0]}, 302))

                        } else {
                            await client.release()

                            return resolve(resultObject(true, `No user found`, {}, 404))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to fetch account details", { error: err }, 500))
        }
    })
}

const checkSubset = (parentArray, subsetArray) => {
    let set = new Set(parentArray);
    return subsetArray.every(x => set.has(x));
  }

const removeSubset = (parentArray, subsetArray) => {
    let myArray = parentArray.filter( ( el ) => !subsetArray.includes( el ) );
    return myArray
}
const bookFlightInDB = (userID,flightID,totalTickets,passengers,seatsBooked)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`SELECT * FROM flights WHERE id=${flightID} AND status=1`)
                        if (queryRes.rows.length > 0) {
                            // successfully inserted
                            const source = queryRes.rows[0].source
                            const destination = queryRes.rows[0].destination
                            const airlineName = queryRes.rows[0].airline_name
                            const time = queryRes.rows[0].time
                            const perCanCharge = queryRes.rows[0].per_can_charge
                            let bookedSeats = JSON.parse(queryRes.rows[0].booked_seats)
                            const availableSeats = JSON.parse(queryRes.rows[0].available_seats)
                            if(totalTickets != seatsBooked.length || totalTickets != passengers.length){
                                return resolve(resultObject(false, `Tickets number and passengers must be equal to seats for booking`, {}, 400))

                            }
                            if(checkSubset(availableSeats,seatsBooked)){
                                // means all seats are available
                                const availableSeatsArrangements = JSON.stringify(removeSubset(availableSeats,seatsBooked))
                                bookedSeats = JSON.stringify(bookedSeats.concat(seatsBooked))
                                const queryRes2 = await client.query(`UPDATE flights SET booked_seats = '${bookedSeats}',available_seats = '${availableSeatsArrangements}' WHERE id = ${flightID}`)

                                if(queryRes2.rowCount > 0){
                                    seatsBooked = JSON.stringify(seatsBooked)
                                    const price = totalTickets * perCanCharge
                                    const queryRes2 = await client.query(`INSERT INTO user_bookings (user_id,passengers,total_tickets,seats_booked,flight_id,price,airline_name,time,source,destination) VALUES (${userID},'${JSON.stringify(passengers)}',${totalTickets},'${seatsBooked}',${flightID},${price},'${airlineName}',${time},'${source}','${destination}')`)
                                    if(queryRes2.rowCount>0){

                                        await client.release()

                                        return resolve(resultObject(true, `Successfully done booking `, {}, 200))

                                    } else {
                                        await client.release()

                                        return resolve(resultObject(false, `Failed to perform booking `, {}, 500))

                                    }
                                } else {
                                    await client.release()

                                    return resolve(resultObject(false, `Failed to perform booking `, {}, 500))

                                }
                            } else {
                                await client.release()

                                return resolve(resultObject(false, `Some seats you taken has been booked`, {}, 400))

                            }
                       

                        } else {
                            await client.release()

                            return resolve(resultObject(true, `Either No such flight exists or has been already departed`, {}, 404))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to fetch account details", { error: err }, 500))
        }
    })
}


const getActiveBookingsFromDB = (userId,pageNo)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const totalRows = 15
            const offset = (pageNo-1)*totalRows
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`SELECT * FROM user_bookings WHERE user_id=${userId} AND status=1 LIMIT  ${totalRows} OFFSET ${offset}`)

                        if (queryRes.rows.length > 0) {
                            await client.release()

                            return resolve(resultObject(true, `Successfully fetched active bookings`, {result:queryRes.rows}, 302))

                        } else {
                            await client.release()

                            return resolve(resultObject(true, `No active booking found`, {}, 404))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to fetch active bookings", { error: err }, 500))
        }
    })
}

const getFlightDataFromDB = (flightID)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        console.log(flightID,566)
                        const queryRes = await client.query(`SELECT * FROM flights WHERE id = ${flightID} `)
                        await client.release()

                        if (queryRes.rows.length > 0) {

                            return resolve(resultObject(true, `Successfully fetched flight data`, {result:queryRes.rows[0]}, 302))

                        } else {

                            return resolve(resultObject(true, `No flight found`, {}, 404))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to fetch flight data", { error: err }, 500))
        }
    })
}

module.exports = {
    addUserInDB,getUserDataFromDB,searchFlightsFromDB,bookFlightInDB,getActiveBookingsFromDB,getFlightDataFromDB
}