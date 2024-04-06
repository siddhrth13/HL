const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/hl', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', () => console.error("Error in connecting to db"));
db.once('open', () => console.log("Connected to database"));

// prateek
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
  });

app.post("/sign_up", (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    const data = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": password
    };

    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error occurred while signing up.");
        } else {
            console.log("Recorded successfully");
            return res.redirect('disease.html');
        }
    });
});

// app.post("/login", (req, res) => {
//     const { email, password } = req.body;

//     db.collection('users').findOne({ email: email, password: password }, (err, user) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("An error occurred. Please try again later.");
//         } else if (user) {
//             return res.redirect('disease.html'); // Redirect to disease.html if login is successful
//         } else {
//             return res.redirect('login.html'); // Redirect back to login.html if credentials are incorrect
//         }
//     });
// });
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.collection('users').findOne({ email: email }, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send("An error occurred. Please try again later.");
        } else if (user) {
            // Check if the password matches
            if (user.password === password) {
                return res.redirect('disease.html'); // Redirect to disease.html if login is successful
            } else {
                // Display an alert for incorrect username/password
                return res.send('<script>alert("Incorrect username/password"); window.location.href = "/login.html";</script>');
            }
        } else {
            // Display an alert for incorrect username/password
            return res.send('<script>alert("Incorrect username/password"); window.location.href = "/login.html";</script>');
        }
    });
});


// const uploadBtn = document.getElementById('uploadButton')

// uploadBtn.addEventListener('click',()=>{
//     event.preventDefault();
//     const imageUrl = formData.get("formFile");
// })

// app.post("/diagnose",(req, res) => {
//     try {
//         const imageUrl = req.body.formFile;
//         const response = fetch("http://3.110.196.103/", {
//             method: "POST",
//             body: JSON.stringify({ imageUrl }),
//             headers: { "Content-Type": "application/json" }
//         });
        
//         const data = response.json();
//         res.json(data); // Send the response back to the frontend
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "An error occurred while processing the request." });
//     }
// });

app.post("/diagnose", async (req, res) => {
    try {
        const imageUrl = req.body.formFile; // Assuming you are sending the image URL
        const response = await fetch("http://3.110.196.103/", {
            method: "POST",
            body: JSON.stringify({ imageUrl }),
            headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();
        
        // Render the prediction data in disease.html
        res.send(`
            <h1>Prediction Results</h1>
            <p>${data.prediction}</p>
        `);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});

// prateek

// app.get('/diagnose', (req, res) => {
//     res.redirect('/signup.html');
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

