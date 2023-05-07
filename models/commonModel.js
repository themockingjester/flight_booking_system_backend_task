const { GetPoolConnection } = require("../utils/databaseConnection")
const { resultObject } = require("../utils/commonUtils")
const checkForEmailExistenceInBothAdminAndUsers = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    try {
                        if (err) {
                            return resolve(resultObject(false, `Failed to connect to database`, { error: err }, 500))

                        } else {
                            const checkInAdmins = new Promise(async (resolve, reject) => {
                                try {
                                    const adminData = await client.query(`SELECT * from admin WHERE email = '${email}'`)
                                    console.log(15)

                                    if (adminData.rows.length > 0) {
                                        return resolve(resultObject(true, `An admin has already using this email`, {}, 302))
                                    } else {
                                        return resolve(resultObject(true, `No admin is using this email`, {}, 404))
                                    }
                                } catch (err) {
                                    return resolve(resultObject(false, `Failed to check for email existence in admin table`, { error: err }, 500))

                                }
                            })

                            const checkInUsers = new Promise(async (resolve, reject) => {
                                try {
                                    const userData = await client.query(`SELECT * from users WHERE email = '${email}'`)
                                    if (userData.rows.length > 0) {
                                        return resolve(resultObject(true, `A user is already using this email`, {}, 302))
                                    } else {
                                        return resolve(resultObject(true, `No user is using this email`, {}, 404))
                                    }
                                } catch (err) {
                                    return resolve(resultObject(false, `Failed to check for email existence in user table`, { error: err }, 500))

                                }
                            })

                            let data = await Promise.all([checkInAdmins, checkInUsers])
                            await client.release()
                            if (data[0].success == true && data[0].code == 302) {
                                // admin exists
                                return resolve(resultObject(true, data[0].message, { role: "ADMIN" }, 302))
                            } else if (data[1].success == true && data[1].code == 302) {
                                // user exists
                                return resolve(resultObject(true, data[1].message, { role: "USER" }, 302))
                            } else if (data[0].code == 404 && data[1].code == 404) {
                                // nither admin or user exists
                                return resolve(resultObject(true, "This email is not used by anyone", {}, 404))

                            } else {
                                return resolve(resultObject(false, "Failed to check for email existence", {}, 500))

                            }
                        }
                    } catch (err) {
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))

                    }

                });
            } else {
                await pool.end()

                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            console.log(err)
            return reject(resultObject(false, "Failed to check for email existence", { error: err }, 500))
        }
    })
}

const getRouteDetailFromDB = (routeId, routeShortName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await GetPoolConnection()
            if (pool) {
                pool.connect(async function (err, client, done) {
                    try {
                        if (err) {
                            return resolve(resultObject(false, `Failed to connect to database`, { error: err }, 500))

                        } else {


                            let data
                            if(routeId){
                                data = await client.query(`SELECT * from routes WHERE id = ${routeId} LIMIT 1`)
                            } else {
                                data = await client.query(`SELECT * from routes WHERE short_name = '${routeShortName}' LIMIT 1`)
                            }
                            if (data.rows.length > 0) {
                                return resolve(resultObject(true, `Successfully fetched route details`, {result:data[0]}, 302))
                            } else {
                                return resolve(resultObject(true, `Failed to fetch route details`, {}, 404))
                            }
                        }
                    } catch (err) {
                        return reject(resultObject(false, "Unable to connect to database", { error: err }, 500))

                    }

                });
            } else {
                await pool.end()

                return reject(resultObject(false, "Unable to connect to database", {}, 500))

            }

        } catch (err) {
            console.log(err)
            return reject(resultObject(false, "Failed to check route details", { error: err }, 500))
        }
    })
}

module.exports = {
    checkForEmailExistenceInBothAdminAndUsers,getRouteDetailFromDB
}