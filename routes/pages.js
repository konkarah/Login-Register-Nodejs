const express = require('express');
const User = require('../core/user');
const Admin = require('../core/admin');
const router = express.Router();
const pool = require('../core/pool');
const { route } = require('express/lib/application');
const path = require('path');
const res = require('express/lib/response');
const celcom = require('../celcom')

// create an object from the class User in the file core/user.js
const user = new User();
const admin = new Admin();

// Get the index page
router.get('/', (req, res, next) => {
    let user = req.session.user;
    // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
    if(user) {
        res.redirect('/home');
        return;
    }
    // IF not we just send the index page.
    res.render('index', {title:"Mezo Application"});
})

// Get home page
router.get('/home', (req, res, next) => {
    let user = req.session.user;

    if(user) {
        let id = user.id;
        let sql = `SELECT * FROM items WHERE ${id} = lec_id`;

        pool.query(sql, user, function(err, results) {
            if(err) throw err;
            res.render('home', {opp:req.session.opp, name:user.fullname, lec_id:user.id, items: results});
        });
        return;
    }
    res.redirect('/');
});

// Post login data
router.post('/login', (req, res, next) => {
    // The data sent from the user are stored in the req.body object.
    // call our login function and it will return the result(the user data).
    user.login(req.body.username, req.body.password, function(result) {
        if(result) {
            // Store the user data in a session.
            req.session.user = result;
            req.session.opp = 1;
            // redirect the user to the home page.
            res.redirect('/home');
        }else {
            // if the login function returns null send this error message back to the user.
            res.send('Username/Password incorrect!');
        }
    })

});


// Post register data
router.post('/register', (req, res, next) => {
    // prepare an object containing all user inputs.
    let userInput = {
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password,
        department: req.body.department
    };
    // call create function. to create a new user. if there is no error this function will return it's id.
    user.create(userInput, function(lastId) {
        // if the creation of the user goes well we should get an integer (id of the inserted user)
        if(lastId) {
            // Get the user data by it's id. and store it in a session.
            user.find(lastId, function(result) {
                req.session.user = result;
                req.session.opp = 0;
                res.redirect('/home');
            });

        }else {
            console.log('Error creating a new user ...');
        }
    });

});


// Get loggout page
router.get('/loggout', (req, res, next) => {
    // Check if the session is exist
    if(req.session.user||req.session.admin) {
        // destroy the session and redirect the user to the index page.
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});

router.get('/register', (req,res)=>{
  res.render('register')
})

router.get('/stuint',(req,res)=> {
  res.sendFile(path.join(__dirname, '../interfaces/stuinterface.html'));
}),

router.post('/item', (req, res) => {
    let user = req.session.user;

    if(user) {
        const tevent = req.body.event;
        const unit = req.body.unit;
        const unitname = req.body.unitname;
        const venue= req.body.venue;
        const cgroup = req.body.group;
        const cyear = req.body.year;
        const lstart = req.body.start;
        const lend = req.body.end;
        const lec_id = user.id;
        const comments = req.body.comments;
        const edate = req.body.date;

        pool.query(
      
            "INSERT INTO items ( tevent, unit, unitname, venue, cgroup,cyear, lstart, lend, lec_id, comments, edate) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            [tevent, unit, unitname, venue, cgroup,cyear, lstart, lend, lec_id, comments, edate],
            (err, result) => {
              if (err) {
                res.send("cannot insert")
                console.log(err)
                pool.end();
              } else {
                res.send("Values Inserted");
              }
            }
          );

        
       
    }
});

router.get('/scheduletoday', (req,res)=> {
  res.render('scheduletoday')
})


router.post('/itemtoday', (req, res) => {
  let user = req.session.user;

  if(user) {
      const tevent = req.body.event;
      const unit = req.body.unit;
      const unitname = req.body.unitname;
      const venue= req.body.venue;
      const cgroup = req.body.group;
      const cyear = req.body.year;
      const lstart = req.body.start;
      const lend = req.body.end;
      const lec_id = user.id;
      const comments = req.body.comments;
      const edate = req.body.date;
      const numbers = [];
      var text = "Hi, you have a "+tevent +" on " + edate + "  : " + unit + " - " + unitname + " at " + venue+ " from " +lstart+ " to " +lend+" . PS "+comments+" . "

      pool.query(
        "SELECT * FROM students WHERE course = ? AND cyear = ?",
        [cgroup,cyear],
        (err,result)=> {
            if(err) {
              console.log(err)
              res.send("could not schedule")
              pool.end()
            }else{
              for(var number of result){
                numbers.push(number.phone_no)
                console.log(numbers)
              }
              numbers.forEach(element=> {
                //send text
                celcom(text,element);
              })
              res.send("Message succesfully sent")
            }
        }        
      );     
  }
});


router.post('/updatetime', (req, res) => {
    const id = req.body.itemid;
    const course = req.body.group;
    const year = req.body.year;
    const unitname = req.body.unitname;
    res.render('time', {id, course,year,unitname});       
  });

  router.post('/updatelessontime/:id', (req,res) => {
    const id = req.params.id;
    const lstart = req.body.start;
    const lend = req.body.end;
    const course = req.body.group;
    const cyear = req.body.year;
    const unitname = req.body.unitname;

    console.log(course)
    console.log(cyear)
    pool.query(
      "UPDATE items SET lstart = ? ,lend = ? WHERE id = ?",
      [lstart, lend, id],
      (err, result) => {
        if (err) {
          res.send("cannot update items")
          pool.end();
        } else {
            res.send ("time updated");
            var text = " Hi, time allocated for your class "+unitname+ " has been changed from " + lstart + " to " + lend + " . "
            let numbers = []
            pool.query(
              "SELECT phone_no FROM students WHERE course = ? AND cyear = ?",
              [course,cyear],
              (err, result) => {
                if(err) throw err;
                for(var number of result){
                  numbers.push(number.phone_no)
                }
                console.log(numbers)

                numbers.forEach(element => {
                  //send message
                
                  celcom(text,element)

              });

              }
            );
        }
      }
    );
  });


 router.get('/delete', (req, res) => {
    const id = req.body.id;
    const unitname = req.body.unitname;
    const group = req.body.group;
    const cyear = req.body.year;
    const numbers = []
    var text = unitname + " - has been cancelled to be rescheduled to a later date"
    pool.query(
      "SELECT * FROM students WHERE course = ? AND cyear = ?", 
      [group, cyear], 
      (err, result) => {
      if (err) {
        res.send("cannot delete")
        pool.end();
      } else {
        for(var number of result){
          numbers.push(number.phone_no)
          console.log(numbers)
        }
        numbers.forEach(element=> {
          //send text
          celcom(text,element);
        })
        res.send("Message succesfully sent")
      }
    });
  });

  router.post('/updatevenue', (req,res) => {
      const id = req.body.itemid;
      const course = req.body.vgroup;
      const year = req.body.year;
      res.render('venue', {id, course, year});
      console.log(course)
  });
  
  router.post('/updatelessonvenue/:id', (req,res) => {
      const id = req.params.id;
      const venue = req.body.venue;
      const course = req.body.group;
      const cyear = req.body.year;
      console.log(course)
      console.log(cyear)


      pool.query(
        "UPDATE items SET venue = ? WHERE id = ?",
        [venue, id],
        (err, result) => {
          if (err) {
            res.send("could not update venue")
            pool.end();
          } else {
              res.send ("venue updated");
              console.log(course)
              
              var text = "Hi, the VENUE for your class has been changed to " + venue + " . "
              let numbers = []
              pool.query(
                "SELECT phone_no FROM students WHERE course = ? AND cyear = ?",
                [course, cyear],
                (err, result) => {
                  if(err) throw err;
                  for(var number of result){
                    numbers.push(number.phone_no)
                  }
                  console.log(numbers)
  
                  numbers.forEach(element => {
                    //send message

                    celcom(text,element)
                    
                });
  
                }
              );
          }
        }
      );
  });


router.get('/ca', (req,res,next) => {
  res.render('classavail.pug')
});

router.post('/classavailability', (req,res) => {
  let user = req.session.user;
  const course = req.body.group;
  const cyear = req.body.year;


  pool.query(
    "SELECT * FROM items WHERE cgroup = ?  AND cyear = ?",
    [course,cyear],
    (err, result) => {
      if(err){
        res.send("could not be selected")
        pool.end();
      }else{
      res.render('classstatus',{items: result})}
    }
  );
});

router.get('/va', (req,res,next) => {
  res.render('venueavail.pug')
});

router.post('/venueavailability', (req,res) => {
  const venue = req.body.venue;
 
  pool.query(
    "SELECT * FROM items WHERE venue = ? ",
    [venue],
    (err, result) => {
      if(err){
        res.send("could not be selected")
        pool.end();
      }else{
      res.render('venuestatus',{items: result})}
    }
  );
});

router.get('/schedule', (req,res) => {
    res.render('schedule')
});

router.get('/lecid', (req,res) => {
  let user = req.session.user;

  if(user){
    const id = user.id;
    res.render('lecid', {id})
    console.log(id)
  }
});

router.get('/scheduleradmin', (req,res,next) => {
  res.render('scheduleradmin');
});

router.post('/itemadmin', (req,res,next) => {

  const tevent = req.body.event;
  const unit = req.body.unit;
  const unitname = req.body.unitname;
  const venue= req.body.venue;
  const cgroup = req.body.group;
  const cyear = req.body.year;
  const lstart = req.body.start;
  const lend = req.body.end;
  const lec_id = req.body.lecid;
  const comments = req.body.comments;
  const edate = req.body.date

  pool.query(
      
    "INSERT INTO items ( tevent, unit, unitname, venue, cgroup,cyear, lstart, lend, lec_id, comments, edate) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [tevent, unit, unitname, venue, cgroup, cyear, lstart, lend, lec_id, comments, edate],
    (err, result) => {
      if (err) {
        res.send("could not be inserted")
        pool.end();
      } else {
        res.send("Values Inserted");
      }
    }
  );

});

router.post('/studentreg', (req,res,next) => {
  const reg_no = req.body.reg;
  const name = req.body.name;
  const phone_no = req.body.phone;
  const course = req.body.course;
  const cyear = req.body.year;
  const department = req.body.dept;

  pool.query(
      
    "INSERT INTO students ( reg_no, student_name, phone_no, course, cyear, department) VALUES (?,?,?,?,?,?)",
    [reg_no, name, phone_no, course,cyear, department],
    (err, result) => {
      if (err) {
        res.send("could not be inserted")
        pool.end();
      } else {
        res.send("Values Inserted");
        console.log(result);
      }
    }
  );
});

router.post('/studentupdate', (req,res,next) => {
  const reg_no = req.body.reg;
  const phone = req.body.phone;
  
  pool.query(
    "UPDATE students SET phone_no = ? WHERE reg_no = ?",
    [phone, reg_no],
    (err, result) => {
      if(err) {
        res.send("could not be updated")
        pool.end();
      }else{
      res.send(" Phone Number Updated")}
    }
  )
});

router.get('/classsize', (req,res) => {
  res.render('classsize');
});

router.post('/classsizeres', (req, res, next) => {
  const group = req.body.group;
  const cyear = req.body.year;

  pool.query(
    "SELECT stu_no FROM class WHERE class_name = ? AND cyear = ?",
    [group,cyear],
    (err, result) => {
      if(err) {
        res.send("could not be inserted")
        pool.end();
      }else {
      res.render('classsizeres', { item: result})}
  }
  );
});


router.get('/venuesize', (req,res) => {
  res.render('venuesize');
});

router.post('/venuesizeres', (req, res, next) => {
  const venue = req.body.venue;

  pool.query(
    "SELECT * FROM venue WHERE venue_name = ?",
    [venue],
    (err, result) => {
      if(err) {
        res.send("could not be selected")
        pool.end();
      }else{
      res.render('venuesizeres', { item: result})}
  }
  );
});

router.post('/registeradmin', (req,res,next) => {
    // prepare an object containing all user inputs.
    let userInput = {
      username: req.body.username,
      fullname: req.body.fullname,
      password: req.body.password,
      department: req.body.department
  };
  // call create function. to create a new user. if there is no error this function will return it's id.
  admin.create(userInput, function(lastId) {
      // if the creation of the user goes well we should get an integer (id of the inserted user)
      if(lastId) {
          // Get the user data by it's id. and store it in a session.
          admin.find(lastId, function(result) {
              req.session.admin = result;
              req.session.opp = 0;
              res.redirect('/adminhome');
          });

      }else {
          console.log('Error creating a new admin ...');
      }
  });
});

router.get('/adminhome', (req,res) => {
  res.sendFile(path.join(__dirname, '../interfaces/admin.html'));
});

router.get('/adminlogin', (req,res) => {
  res.render('adminloginpage')
});

router.post('/adminlogin', (req,res) => {
  admin.login(req.body.username, req.body.password, function(result) {
    if(result) {
        // Store the user data in a session.
        req.session.admin = result;
        req.session.opp = 1;
        // redirect the user to the home page.
        res.sendFile(path.join(__dirname, '../interfaces/admin.html'));
    }else {
        // if the login function returns null send this error message back to the user.
        res.send('Username/Password incorrect!');
    }
})
});

router.get('/message', (req,res,next) => {
  res.render('message')
});

router.post('/message', (req,res,next) => {
  const tmessage = req.body.message;
  const cgroup = req.body.group;
  const cyear = req.body.year;
  const estart = req.body.start;
  const edate = req.body.date;

  pool.query(
    "INSERT INTO stu_message ( tmessage, cgroup, cyear,estart, edate) VALUES (?,?,?,?,?)",
    [tmessage, cgroup, cyear, estart, edate],
    (err, result) => {
      if(err) {
        res.send("could not be inserted")
        console.log(err)
        pool.end();
      }else{
      res.send("message inserted");}

      //api to send text
    }
  );
});

router.post('/stuissue', (req,res, next) => {
  const issue = req.body.issue;
  const reg_no = req.body.reg_no;

  pool.query(
    "INSERT INTO stu_issue(issue, reg_no) VALUES (?,?)",
    [issue, reg_no],
    (err, result)=> {
    if(err) {
      res.send("could not be inserted")
      pool.end();
    }else{
    res.send("issue noted");}
    }
  );
});

router.get('/deptissues', (req,res,next)=> {
  res.render('deptissue')
})

router.get('/studentissueslist', (req,res,nest) => {
  pool.query(
    "SELECT * FROM stu_issue",
    (err, result)=> {
      if(err)  {
        res.send("could not be selected")
        pool.end();
      }else{
      res.render('issueslist',{items:result});}
    }
  );
});

router.get('/lecids', (req,res,next)=>{
  pool.query(
    "SELECT * FROM users",
    (err, result)=> {
      if(err)  {
        res.send("could not be selected")
        pool.end();
      }else{
      res.render('lecids',{items:result});}
    }
  );
});

// Get loggout page
router.get('/adminlogout', (req, res, next) => {
  // Check if the session is exist
  if(req.session.admin) {
      // destroy the session and redirect the user to the index page.
      req.session.destroy(function() {
          res.redirect('/');
      });
  }
});

router.post('/issuesolved', (req,res,next)=> {
  const id = req.body.itemid;

  pool.query(
    "DELETE FROM stu_issue WHERE id = ?",
    [id],
    (err,result)=>{
      if(err) {
        res.send("could not be deleted")
        pool.end();
      }else{
      res.send("issue deleted from database");}
    }
  );
});

router.get('/stuintissue', (req,res)=> {
  res.sendFile(path.join(__dirname, '../interfaces/stu_issue.html'));
});

router.get('/stuintregister', (req,res)=> {
  res.sendFile(path.join(__dirname, '../interfaces/studentregistration.html'));
});

router.get('/stuintupdate', (req,res)=> {
  res.sendFile(path.join(__dirname, '../interfaces/studentupdate.html'));
});

router.get('/saloginpage', (req,res)=> {
  res.sendFile(path.join(__dirname, '../interfaces/salogin.html'));
});

router.post('/sahome', (req,res) => {
  const password = req.body.password;
  const lp = 123456;

  if(password==lp){
    res.sendFile(path.join(__dirname, '../interfaces/sa.html'));
  }else{
    res.send("wrong password");
  }
});

router.get('/classplan',(req,res)=> {
  res.render('classplan');
});

router.post('/classplan', (req,res,next) => {
  let items = []
  var courses = []
  var newdate = req.body.date;
  console.log(newdate)
    
  let sql = `SELECT * FROM items WHERE edate = '${newdate}' `;
 

  pool.query(sql, (err,result) => {
        if(err){
          console.log(err)
          pool.end()
        }
        for( var item of result){
            items.push(item)
           // console.log(item)
        }
        items.forEach(element => {
            let course = element.cgroup
            let cyear = element.cyear
            let event = element.tevent
            let date = element.edate
            let unit = element.unit
            let unitname = element.unitname
            let venue = element.venue
            let start = element.lstart
            let end = element.lend
            let comments = element.comments

            let numbers = []
            let stunos = `SELECT * FROM students WHERE course='${course}' AND cyear = '${cyear}'`
            pool.query(stunos, (err, result) => {
                if(err){
                  console.log(err);
                  pool.end();
                }
                for(var number of result){
                    numbers.push(number.phone_no)
                }
                numbers.forEach(element => {
                    //send message
                    console.log("Hi, you have a "+event +" on " + date + "  : " + unit + " - " + unitname + " at " + venue+ " from " +start+ " to " +end+" . PS: "+comments+" . ")
                    var text = "Hi, you have a "+event +" on " + date + "  : " + unit + " - " + unitname + " at " + venue+ " from " +start+ " to " +end+" . PS"+comments+" . "
                    
                    celcom(text,element)
                    res.send("message sent")
                });
            })
        });
    })
});

router.get('/venuecapacity', (req,res,next)=>{
  res.render('venuecapacity');
});

router.post('/venuecapacityinsert', (req,res,next)=>{
  const venue_name = req.body.venue;
  const capacity = req.body.capacity;

  pool.query(
    "INSERT INTO venue(venue_name, capacity) VALUES (?,?)",
    [venue_name, capacity],
    (err, result)=> {
      if(err) {
        res.send("could not be inserted")
        pool.end();
      }else{
      res.sendFile(path.join(__dirname, '../interfaces/sa.html'));}
    }
  )
})

router.get('/communications',(req,res)=> {
  res.render('comlogin');
});

router.post('/comint', (req,res)=> {
  const name = req.body.username;
  const password = req.body.password;

  let comname = "communications";
  let compassword = "wearecomm";

  if(name==comname&&password==compassword){
    res.render('cominterface');
  }
});

router.get('/comstudent', (req,res)=> {
  res.render('comstudent');
});

router.get('/comgroup', (req,res)=> {
  res.render('comgroup');
});

router.post('/comstudentsend', (req,res)=> {
  var text = req.body.message;
  var regnos = [req.body.regno];

  regnos.forEach(element => {
    celcom(text, element)
  });

});

router.post('/comgroupsend', (req,res)=> {
  var text = req.body.messsage;
  const course = req.body.group;
  const cyear = req.body.year;

  var numbers = []
  pool.query(
              "SELECT phone_no FROM students WHERE course = ? AND cyear = ?",
              [course, cyear],
              (err, result) => {
                if(err) throw err;
                for(var number of result){
                  numbers.push(number.phone_no)
                }
                console.log(numbers)

                numbers.forEach(element => {
                  //send message
                
                  celcom(text, element)

              });

              }
            );
  
})

router.post('/deletemysq', (req,res)=> {
  var dateObj = new Date();
  const edate = dateObj.getDate()-1;
  pool.query(
    "DELETE FROM items WHERE edate = ?",
    [edate],
    (err,result)=>{
      if(err){
        console.log(err)
        pool.end
      }else{
        res.send("yesterdays records deleted")
      }
    }
  )
});

router.get('/comdepartment', (req,res)=> {
  res.render('comdepartment')
})

router.post('/comdepartmentsend', (req,res)=> {
  const dept = req.body.dept;
  var text = req.body.message;
  var numbers = []

  pool.query(
    "SELECT * FROM students WHERE department = ?",
    [dept],
    (err,result)=> {
      if(err) {
        console.log(err)
        res.send("could not send text")
        pool.end()
      }else{
        for(var number of result){
          numbers.push(number.phone_no)
          console.log(numbers)
        }
        numbers.forEach(element=> {
          //send text
          celcom(text,element);
        })
        res.send("Message succesfully sent")
      }
    }
  )
});

router.get('/comyear', (req,res)=> {
  res.render('comyear')
})

router.post('/comyearsend', (req,res)=> {
  const year = req.body.year;
  var text = req.body.message;
  var numbers = []

  pool.query(
    "SELECT * FROM students WHERE cyear = ?",
    [year],
    (err,result)=> {
      if(err) {
        console.log(err)
        res.send("could not send text")
        pool.end()
      }else{
        for(var number of result){
          numbers.push(number.phone_no)
          console.log(numbers)
        }
        numbers.forEach(element=> {
          //send text
          celcom(text,element);
        })
        res.send("Message succesfully sent")
      }
    }
  )
});

router.get('/comdeptyear', (req,res)=> {
  res.render('comdeptyear')
})

router.post('/comdeptyearsend', (req,res)=> {
  const year = req.body.year;
  const dept = req.body.dept;
  var text = req.body.message;
  const numbers = [];

  pool.query(
    "SELECT * FROM students WHERE department = ? and cyear = ?",
    [dept,year],
    (err,result)=>{
      if(err){
        console.log(err)
        res.send("Message not sent")
        pool.end()
      }else{
        console.log(result)
        for(var number of result){
          numbers.push(number.phone_no)
          console.log(numbers)
        }
        numbers.forEach(element=> {
          //send text
          celcom(text,element);
        })
        res.send("Message succesfully sent")
      }
    }
  )

});

router.get('/comallstudents', (req,res)=> {
  res.render('comallstudents')
});

router.post('/comallstudentssend', (req,res)=> {
  var text = req.body.message;
  const numbers = []
  pool.query(
    "SELECT * FROM students",
    (err,result)=> {
      if(err) {
        console.log(err)
        res.send("could not send text")
        pool.end()
      }else{
        for(var number of result){
          numbers.push(number.phone_no)
          console.log(numbers)
        }
        numbers.forEach(element=> {
          //send text
          celcom(text,element);
        })
        res.send("Message succesfully sent")
      }
    }
  )
});

module.exports = router;