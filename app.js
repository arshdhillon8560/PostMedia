const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const Post = require("./models/posts");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const app = express();

mongoose.connect("mongodb+srv://arshdhillon8560:Arshdhillon%4004@arshclustor.qfrul66.mongodb.net/?retryWrites=true&w=majority&appName=ArshClustor")
  .then(() => console.log('MongoDB Connected..'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Middlewares
app.set("view engine", 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).populate("posts");
        if (!user) return res.status(404).send("User not found");
        res.render("profile", { user });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
        const post = await Post.findOne({ _id: req.params.id });

        const userId = req.user.userid;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId); 
        } else {
            post.likes.splice(index, 1); 
        }

        await post.save();
        res.redirect('/profile');
       
   
});


app.get('/edit/:id', isLoggedIn, async (req, res) => {

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send("Post not found");

      
        if (post.user.toString() !== req.user.userid) {
            return res.status(403).send("Unauthorized");
        }

        res.render('edit', { post });
    
});

app.post('/edit/:id', isLoggedIn, async (req, res) => {
    
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send("Post not found");

        if (post.user.toString() !== req.user.userid) {
            return res.status(403).send("Unauthorized");
        }

        post.content = req.body.content;
        await post.save();

        res.redirect('/profile');
   
});


app.post("/post", isLoggedIn, async(req, res) => {  
    const user= await User.findOne({email:req.user.email});
    const {content}=req.body;
    const post = await Post.create({
        user:user._id,
        content,
    })
    user.posts.push(post._id);
    await  user.save();
    res.redirect('/profile');
});


app.post('/register', async (req, res) => {
    try {
        const { email, password, username, age, name } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).send("User already registered");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            name,
            age,
            password: hash,
        });

        const token = jwt.sign({ email, userid: user._id }, "shshshshshshsh");
        res.cookie("token", token);
        return res.send("registered");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Something went wrong");
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).send("User not found");

        const result = await bcrypt.compare(password, user.password);

        if (result) {
            const token = jwt.sign({ email, userid: user._id }, "shshshshshshsh");
            res.cookie("token", token);
            return res.redirect('/profile');
        } else {
            return res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Login failed");
    }
});

app.get('/logout', (req, res) => {
    res.cookie("token", '');
    return res.redirect('/login');
});

// Auth Middleware
function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) return res.redirect('/login');

        const data = jwt.verify(token, "shshshshshshsh");
        req.user = data;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).send("Invalid or expired token");
    }
}

// Start server
app.listen(3000, () => {
    console.log("Server started at 3000..");
});
