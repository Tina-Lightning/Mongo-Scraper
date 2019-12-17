var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require the models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();



// Middleware

// Morgan logs requests
app.use(logger("dev"));
// Parse requests as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to Mongo DB
mongoose.connect(
  process.env.MONGODB_URI ||
  "mongodb://user1:password1@ds311538.mlab.com:11538/heroku_cgwkhq85",
  {
    useMongoClient: true
  }
);

// Routes

// The GET request scrapes the Vulture website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.vulture.com/tv/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $(".article-wrap").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element)
        .children(".main-article-content")
        .find(".headline")
        .text();

      result.summary = $(element)
        .children(".main-article-content")
        .find(".teaser")
        .text();

      result.link = "https:" + $(element)
        .children(".main-article-content")
        .find("a")
        .attr("href");

      result.image = $(element)
        .children(".article-img-wrapper ")
        .find("picture img")
        .attr("data-src");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all the Articles from the database
app.get("/articles", function (req, res) {
  // Get all the documents in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // if you find the Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // Log an error if it occurred 
      res.json(err);
    });
});

// Route for getting a specific article by id & populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Find the correct article by id
  db.Article.findOne({ _id: req.params.id })
    // and populate it with all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // if you find the correct Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // Log an error if it occurred 
      res.json(err);
    })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pas the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // this updates the Article with the new Note
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // Log an error if it occurred 
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});