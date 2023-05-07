const { Client, Pool } = require("pg")
const config = require("../config/default.json")
// let client

const GetPoolConnection = async () => {
    try {
        let configDB = {
            user: config.Database.user,
            host: config.Database.host,
            database: config.Database.database,
            password: config.Database.password,
            port: config.Database.port
        }
        // client = new Client(configDB)

        const pool = new Pool(configDB)
        return pool
        // if(!pool){
        //     pool.connect(async function (err, client, done) {
        //         if (err) throw new Error(err);
        //         var ageQuery = format('SELECT * from admin')
        //         let data = await client.query(ageQuery)
                
        //       }); 
        //       await pool.end()
        // }
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    GetPoolConnection
}

