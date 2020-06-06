const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { check, validationResult } = require('express-validator');

const mongojs = require('mongojs')
const db = mongojs('customerapp', ['users'])
const ObjectId = mongojs.ObjectId;

const app = express();

// middleware
/*
const logger = function(req, res, next) {
    console.log('Logging...');
    next();
}
app.use(logger);*/

app.use(function(req,res,next) {
    res.locals.errors = null;
    next();    
})

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname, 'static')));

const users = [
    {
        id:1,
        f_name:'Leon',
        l_name:'Wakoli',
        email:'leonbaraza@gmail.com'
    },
    {
        id:2,
        f_name:'Salome',
        l_name:'Wamachaba',
        email:'swama@gmail.com'
    },
    {
        id:3,
        f_name:'Linda',
        l_name:'Namwaya',
        email:'lnams@gmail.com'
    },
]

// configure your routes
app.get('/', function(req, res) {
    db.users.find(function (err, docs) {
        // console.log(docs);
        const title = 'Customers';
        res.render('index',{
            title:title,
            users: docs
        });
    });
});
app.use(express.json())
app.post('/users/add', [
    check('fname', 'First name is required').notEmpty(),
    check('lname', 'Last name is required').notEmpty(),
    check('email')
    .isEmail()
    .normalizeEmail(),
    ], function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            db.users.find(function (err, docs) {
                // console.log(docs);
                const title = 'Customers';
                res.render('index',{
                    title:title,
                    users: docs,
                    errors:errors
                });
            });
            // console.log(typeof(errors));
            // console.log(errors.errors);
            // return res.status(422).json({ errors: errors.array() });
          } else{            
            const new_user = {
                f_name : req.body.fname,
                l_name : req.body.lname,
                email : req.body.email,
            }
            db.users.insert(new_user, function(err, result) {
                if(err){
                    console.log(err);
                }
                res.redirect('/');
            });
        }
});

app.delete('/users/delete/:id', function(req, res) {
    db.users.remove({_id:ObjectId(req.params.id)}, function(err,result) {
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
});

// Set a listening port
app.listen(3000, function(){
    console.log('Server started on port 3000....')
});