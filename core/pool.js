const util = require('util');
const mysql = require('mysql');
/**
 * Connection to the database.
 *  */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '192.168.64.2',
    user: 'deh', // use your mysql username.
    password: '1234', // user your mysql password.
    database: 'mmustsys'
});

pool.getConnection((err, connection) => {
    if(err){ 
        console.error("Something went wrong connecting to the database ...")
    }
    if(connection)
        connection.release();
        console.log('Database connected')
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;
