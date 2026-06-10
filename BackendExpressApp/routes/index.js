var express = require('express');
var router = express.Router();
const { env } = require('process');

// models
const satellite = require("../models/satellite");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Test route */
router.get("/test", function (req, res) {
  res.json({
    message: "Backend is working"
  });
});


/* NASA API */
router.get("/nasa", async function (req, res) {
  try {
    const url = `${process.env.NASA_BASE_URL}/planetary/apod?api_key=${process.env.NASA_API_KEY}`;
    console.log("Fetching NASA APOD from URL:", url);
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Launch Library 2 API */
router.get("/launches", async function (req, res) {
  try {
    const url = `${process.env.LAUNCH_LIBRARY_URL}/launch/upcoming/?limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Spaceflight News API */
router.get("/space-news", async function (req, res) {
  try {
    const url = `${process.env.SPACEFLIGHT_NEWS_URL}/articles/?limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* SpaceX API */
router.get("/spacex-launches", async function (req, res) {
  try {
    const url = `${process.env.SPACEX_API_URL}/launches/upcoming`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Where The ISS At API */
router.get("/iss-location", async function (req, res) {
  try {
    const url = process.env.WHERE_THE_ISS_AT_URL;

    const response = await fetch(url);
    const data = await response.json();
    console.log("ISS Location Data:", data);

    const issData = new satellite({
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
    });

    await satellite.create(issData)
      .then((savedData) => {
        console.log("ISS data saved to MongoDB:", savedData);
      })
      .catch((error) => {
        console.error("Error saving ISS data to MongoDB:", error.message);
      });

    res.json(issData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Open Notify ISS API */
// router.get("/open-notify-iss", async function(req, res) {
//   try {
//     const url = process.env.OPEN_NOTIFY_URL;

//     const response = await fetch(url);
//     const data = await response.json();

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



module.exports = router;
