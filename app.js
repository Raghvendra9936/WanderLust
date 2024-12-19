if(process.env.NODE_ENV != "production"){
  require('dotenv').config(); 
}

// console.log(process.env.SECRET);


const express = require("express");
const bodyParser = require('body-parser');
const app=express();
const mongoose = require("mongoose");
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const listingsRouter=require("./routes/listiing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");




app.use(express.static(path.join(__dirname, "/public")));

// session
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const mongo_url = "mongodb://127.0.0.1:27017/wonderlust";
main()
  .then(()=>{
    console.log("connect to db");
  })
  .catch((err)=>{
    console.log(err);
  });
  
async function main(){
    await mongoose.connect(mongo_url);
}
// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // If you are expecting JSON data as well
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname,"views"));


// home Route
app.get("/", (req, res) => {
  res.send(" Hey I Am home");
});

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
   
  // console.log(res.locals.success);
  next();
})

// app.get("/demouser", async(req, res)=>{
//   let fakeuser  = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });
//   let regiterUser = await User.register(fakeuser, "helloworld");
//   res.send(regiterUser);
// });

// validate review Schema
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);



// app.get("/testListing", async (req, res)=>{
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the Bench",
//     price: 1200,
//     location: "calcuta, Goa",
//     Country: "India",
//   });
//   await sampleListing.save();
//   console.log("sample is saved");
//   res.send("Succesfull testing");
// } );
app.all("*", (req, res, next)=>{
  next(new ExpressError(404, " Page Not Found"));
})

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
})