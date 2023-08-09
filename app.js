const express = require("express");
const app = express();
const path = require("path")
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookiePaser = require('cookie-parser');

// MONGO CONNECTION
dotenv.config({ path: './.env' }); 
const url = process.env.URL
mongoose.connect(url)

// EJS SETTING
app.set("view engine", "ejs");

// PORT SETTING
const PORT = process.env.PORT || 3000;

// SESSION SETTING
app.use(cookiePaser());
const key = process.env.KEY;
const oneDay = 1000 * 60 * 60 * 24;
app.use(
    session({
        secret: key,
        saveUninitialized: false,
        cookie: { maxAge: oneDay },
        resave: false,
        store: new MongoStore({mongooseConnection: mongoose.connection })
    })   
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// MULTER IMAGE PATH FOR FROND END
app.use('/productImages', express.static(path.resolve(__dirname, 'productImages')));

app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    next();
});

// ROUTER IMPORTING
const userRouter = require('./route/user');
const adminRouter = require('./route/admin');

app.use('/', userRouter);
app.use('/admin', adminRouter);

// PORT LISTEN
app.listen(PORT, () => {
    console.log(`the server Running successfully http://localhost:${PORT}/`)
})