const { GetPoolConnection } = require("../utils/databaseConnection")
const { resultObject } = require("../utils/commonUtils")
const addAdminInDB = (email, name, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`INSERT INTO admin (email,name,password) values ('${email}','${name}','${password}')`)

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
            return reject(resultObject(false, "Failed to add admin account", { error: err }, 500))
        }
    })
}

const getAdminDataFromDB = (email,password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`SELECT * FROM admin WHERE email='${email}' AND password='${password}'`)

                        if (queryRes.rows.length > 0) {
                            // successfully inserted
                            await client.release()

                            return resolve(resultObject(true, `Successfully fetched account details`, {result:queryRes.rows[0]}, 302))

                        } else {
                            await client.release()

                            return resolve(resultObject(true, `No admin found`, {}, 404))
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

const registerNewRouteInDB = (routeName,shortName)=>{
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`INSERT INTO routes (short_name,name) VALUES ('${shortName}','${routeName}')`)
                        if (queryRes.rowCount > 0) {
                            // successfully inserted
                            await client.release()

                            return resolve(resultObject(true, `Successfully added route`, {}, 200))

                        } else {
                            await client.release()

                            return resolve(resultObject(false, `Failed to add route`, {}, 500))
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to add route", { error: err }, 500))
        }
    })
}

const registerFlightDetailsInDB = (airlineName,source,destination,date,time,totalSeats,perCandidateCharge)=>{
    return new Promise(async (resolve, reject) => {
        try {
            date = `${date}`.trim()
            time = `${time}`.trim()
            let timeAsTimeStamp = new Date(`${date} ${time}`).getTime()
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    if (err) {
                        await client.release()
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))
                    } else {
                        const queryRes = await client.query(`SELECT * FROM flights WHERE source='${source}' AND destination='${destination}' AND time= ${timeAsTimeStamp} AND airline_name='${airlineName}' LIMIT 1`)
                        if (queryRes.rows.length > 0) {
                            // successfully inserted
                            await client.release()

                            return resolve(resultObject(true, `Similar flight already exists`, { result : queryRes.rows[0]}, 302))

                        } else {


                            let availableSeats = []
                            for (let i = 0; i < totalSeats; i++) {
                                availableSeats.push(i+1)
                            }
                            availableSeats=JSON.stringify(availableSeats)
                            const bookedSeats = JSON.stringify([])
                            const queryRes2 = await client.query(`INSERT INTO flights (source,destination,airline_name,time,total_seats,available_seats,booked_seats,per_can_charge) VALUES ('${source}','${destination}','${airlineName}',${timeAsTimeStamp},${totalSeats},'${availableSeats}','${bookedSeats}',${perCandidateCharge})`)
                            await client.release()
                            if(queryRes2.rowCount>0){
                                return resolve(resultObject(true, `Successfully added flight data`, {}, 200))
                            } else {
                                return resolve(resultObject(false, `Failed to flight data`, {}, 500))
                            }
                        }
                    }
                });
            } else {
                await pool.end()
                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            return reject(resultObject(false, "Failed to add flight data", { error: err }, 500))
        }
    })
}
module.exports = {
    addAdminInDB,getAdminDataFromDB,registerNewRouteInDB,registerFlightDetailsInDB
}