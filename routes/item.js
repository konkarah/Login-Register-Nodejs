const express = require('express');
const router = express.Router();
const pool = require('../core/pool');
const mysql = require('mysql');


router.post('/item', (req, res) => {

    const db = mysql.createConnection({
        host: '192.168.64.2',
        user: 'deh',
        password: '1234',
        database: 'mmustsys'
    
    });
    
    //connect
    db.connect((err) => {
        if(err){
            throw err;
        }
        console.log('mysql connected')
    })
    

    const tevent = req.body.event;
    const unit = req.body.unit;
    const unitname = req.body.unitname;
    const venue= req.body.venue;
    const cgroup = req.body.group;
    const lstart = req.body.start;
    const lend = req.body.end;
    const lec_id = req.body.id;

    /*let sql = `INSERT INTO items (tevent, unit, unitname, venue, cgroup, lstart, lend, lec_id) VALUES (?,?,?,?,?,?,?,?)`;

    pool.query(sql, user, function(err, results) {
        if(err) throw err;
        res.send("values inserted");
    });
    return;
    */
    db.query(
      
      "INSERT INTO items ( tevent, unit, unitname, venue, cgroup, lstart, lend, lec_id) VALUES (?,?,?,?,?,?,?,?)",
      [tevent, unit, unitname, venue, cgroup, lstart, lend, lec_id],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Values Inserted");
        }
      }
    );
})

module.exports = router;