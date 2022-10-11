const express = require('express');
const app = express();
bodyParser = require('body-parser');
const fs = require('fs');
const util = require('util');
var session = require('express-session')
const port = 3000;



// data base connection
var mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expense'
});

//checking connection
connection.connect((err) => {
    if (err) throw err;
})

// manage session
app.use(session({
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//setting view engine to ejs
app.set("view engine", "ejs");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())




// get  emanager

app.get('/', (req, res) => {
    console.log('  Emanager get request');
    res.render("emanager");
});
// login 

app.get('/login', (req, res) => {
    console.log('  login get request');
    res.render(__dirname + "/views/login");
});

app.post('/login', function (req, res) {
    console.log('post request login-form ');
    let body = req.body;
    var email = req.body.email;
    var password = req.body.password;
    if (body.email === "") {
        console.log("email is empty, please fill email");
        return res.render(__dirname + "/views/login", {
            emailError: 'email is empty, please fill email',
            body
        });
    }
    if (body.password === "") {
        console.log("password is empty, please fill password");
        return res.render(__dirname + "/views/login", {
            passwordError: 'password is empty, please fill password',
            body
        });
    }
    var mysql = 'SELECT * FROM singup WHERE email =? AND password =?';
    connection.query(mysql, [email, password], function (err, data, fields) {
        if (err) throw err
        if (data.length > 0) {
            req.session.loggedinUser = true;
            req.session.email = email;
            console.log('successgully login');
            res.render('home')
            {
                success: 'add successfully', body
            }

        }
        else {
            res.render(__dirname + '/views/login', { alertMsg: "Your Email Address or password is wrong" });
        }
    })
})
// sing up
app.get('/singup', (req, res) => {
    console.log(' singup  get request');
    res.render(__dirname + "/views/singup");
});

app.post('/singup', async (req, res) => {
    console.log(' singup  post request');
    let body = req.body,
        name = req.body.name,
        number = body.number,
        email = body.email,
        password = body.password

    if (body.name === "") {
        console.log("name is empty, please fill name");
        return res.render(__dirname + "/views/singup", {
            nameError: 'name is empty, please fill name',
            body
        });
    }

    if (body.number === "") {
        console.log("number is empty, please fill number");
        return res.render(__dirname + "/views/singup", {
            numberError: 'number is empty, please fill number',
            body
        });
    }

    if (body.email === "") {
        console.log("email is empty, please fill email");
        return res.render(__dirname + "/views/singup", {
            emailError: 'email is empty, please fill email',
            body
        });
    }

    if (body.password === "") {
        console.log("password is empty, please fill password");
        return res.render(__dirname + "/views/singup", {
            passwordError: 'email is password, please fill password',
            body
        });
    }


    //"insert form data to singup table"
    var sql = `INSERT INTO singup (name, number, email,password) VALUES ('${body.name}','${body.number}','${body.email}','${body.password}')`;

    connection.query(sql, function (err, result) {
        console.log(body);
        res.render('emanager', {
            success: 'add successfully',
            body
        });
    });
});

// home page
app.get('/home', async (req, res) => {
    console.log(' home get request');
    if (req.session.loggedinUser) {
        res.render('home', { email: req.session.emailAddress })
    } else {
        res.render('emanager');
    }
});

// income
app.get('/addincome', (req, res) => {
    console.log(' add income get request');
    if (req.session.loggedinUser) {
        res.render(__dirname + '/views/incomes/addincome', { email: req.session.emailAddress })
    } else {
        res.render('emanager');
    }
});

app.post('/addincome', (req, res) => {
    console.log('addincome post request');

    let body = req.body;
    let date = body.date;
    let item = body.item;
    let amount = body.amount;

    if (body.date === "") {
        console.log("date is empty, please fill date");
        return res.render(__dirname + "/views/incomes/addincome", {
            dateError: 'date is empty, please fill date',
            body
        });
    }

    if (body.item === "") {
        console.log("item is empty, please fill item");
        return res.render(__dirname + "/views/incomes/addincome", {
            itemError: 'item is empty, please fill item',
            body
        });
    }

    if (body.amount === "") {
        console.log("amount is empty, please fill amount");
        return res.render(__dirname + "/views/incomes/addincome", {
            amountError: 'amount is empty, please fill amount',
            body
        });
    }
    //"insert form data to incomes table"
    var sql = `INSERT INTO addincome (date, item, amount) VALUES ('${body.date}','${body.item}', '${body.amount}')`;

    connection.query(sql, function (err, result) {
        console.log("income added successfully");
        res.render(__dirname + "/views/incomes/addincome", {
            success: 'add successfully',
            body
        });
    });
});

app.get('/income_edit/:id', (req, res) => {
    console.log('get  request  edit income');
    var id = req.params.id;

    //Select all incomes and return the result object:
    connection.query(`SELECT * FROM incomes where id =${id} limit 1`, function (err, result, fields) {
        if (err) throw err;
        console.log(result[0]);
        res.render(__dirname + "/views/incomes/income_edit", { result: result[0] });
    });
});

app.get('/income_delete/:id', (req, res) => {
    console.log('get  request  delete income');
    var id = req.params.id;

    //one income and delete it from database:
    connection.query(`DELETE FROM incomes WHERE id = "${id}"`, function (err, result, fields) {
        if (err) throw err;
        console.log(result[0]);
        res.redirect("http://localhost:3000/income");
    });
});

// expense
app.get('/addexpense', (req, res) => {
    console.log(' addexpense  get request');
    if (req.session.loggedinUser) {

        res.render(__dirname + '/views/expenses/addexpense', { email: req.session.emailAddress })
    } else {
        res.render('emanager');
    }
});

app.post('/addexpense', (req, res) => {
    console.log(' add expense post request');
    let body = req.body;
    let date = body.date;
    let item = body.item;
    let amount = body.amount;

    if (body.date === "") {
        console.log("date is empty, please fill date");
        return res.render(__dirname + "/views/expenses/addexpense", {
            dateError: 'date is empty, please fill date',
            body
        });
    }

    if (body.item === "") {
        console.log("item is empty, please fill item");
        return res.render(__dirname + "/views/expenses/addexpense", {
            itemError: 'item is empty, please fill item',
            body
        });
    }

    if (body.amount === "") {
        console.log("amount is empty, please fill amount");
        return res.render(__dirname + "/views/expenses/addexpense", {
            amountError: 'amount is empty, please fill amount',
            body
        });
    }

    //"insert into expense "
    var sql = `INSERT INTO addexpense (date,item, amount) VALUES ('${body.date}','${body.item}', '${body.amount}')`;

    connection.query(sql, function (err, result) {
        console.log("expense added successfully");

        res.render(__dirname + "/views/expenses/addexpense", {
            success: 'add successfully',
            body
        });
    });
});

app.get('/expense_edit/:id', (req, res) => {
    console.log('get  request  edit expense');
    var id = req.params.id;

    //Select all incomes and return the result object:
    connection.query(`SELECT * FROM expenses where id =${id} limit 1`, function (err, result, fields) {
        if (err) throw err;
        console.log(result[0]);
        res.render(__dirname + "/views/expenses/expense_edit", { result: result[0] });
    });
});

app.get('/expense_delete/:id', (req, res) => {
    console.log('get  request  delete expense');
    var id = req.params.id;

    //Select one expense and delete it from database:
    connection.query(`DELETE FROM expenses WHERE id = "${id}"`, function (err, result, fields) {
        if (err) throw err;
        console.log(result[0]);
        res.redirect("http://localhost:3000/expense");
    });
});

app.get('/expense', async (req, res) => {
    console.log('expense get request');


    // nested callback
    /*	connection.query("SELECT * FROM addexpense",function(err, firstResult) {
           if (err) throw err;
           connection.query("SELECT SUM(amount) AS amount FROM addexpense",function(err, totalAmount) {
       	
               console.log('totalAmount',totalAmount[0].amount);
               res.render('expense',{result:firstResult, totalAmount: totalAmount});
           });
   }); })*/

    try {
        let expense = await new Promise((resolve, reject) => {
            connection.query("SELECT * FROM addexpense", function (err, firstResult) {
                if (err) throw err;
                connection.query("SELECT SUM(amount) AS amount FROM addexpense", function (err, TotalAmount) {

                    resolve({ result: firstResult, Expense: TotalAmount[0].amount });
                });
            });
        });
        res.render(__dirname + "/views/expenses/expense", { ...expense });
    } catch (error) {
        console.log(error);
    }
});


app.get('/income', async (req, res) => {
    console.log('income get request');

    try {
        let income = await new Promise((resolve, reject) => {
            connection.query("SELECT * FROM addincome", function (err, firstResult) {
                if (err) throw err;
                connection.query("SELECT SUM(amount) AS amount FROM addincome", function (err, TotalIncome) {

                    resolve({ result: firstResult, Income: TotalIncome[0].amount });
                });
            });
        });
        res.render(__dirname + '/views/incomes/income', { ...income });
    } catch (error) {
        console.log(error);
    }
});

/* GET users listing. */
app.get('/logout', function (req, res) {
    console.log('logout');
    req.session.destroy();
    res.render('emanager');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
