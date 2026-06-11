// THIS IS OLD
// var express = require('express');
// var router = express.Router();
// const { env } = require('process');

// // models
// const satellite = require("../models/satellite");
// const Agency = require("../models/agency");
// const Launch = require("../models/Launch");
// const Mission = require("../models/mission");
// const Rocket = require("../models/rocket");

import express from 'express';
import { env } from 'process';

//importing them
import satellite from "../models/satellite.js";
import Agency from "../models/agency.js"
import Launch from "../models/Launch.js"
import Mission from "../models/mission.js"
import Rocket from "../models/rocket.js"

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
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

    if (!data.results) {
      return res.status(400).json({
        error: "No launch results found",
        data: data,
      });
    }

    const launches = [];

    for (const item of data.results) {
      const agency = await Agency.create({
        name: item.launch_service_provider?.name || "Unknown Agency",
        variant: item.launch_service_provider?.type || "Unknown",
        launchers: [],
        spacecraft: "Unknown",
      });

      const rocket = await Rocket.create({
        fullname:
          item.rocket?.configuration?.full_name ||
          item.rocket?.configuration?.name ||
          "Unknown Rocket",
        variant: item.rocket?.configuration?.variant || "Unknown",
        configId: item.rocket?.configuration?.id || 0,
      });

      const mission = await Mission.create({
        name: item.mission?.name || "Unknown Mission",
        description: item.mission?.description || "No description available",
        orbit: item.mission?.orbit?.name || "Unknown Orbit",
        type: item.mission?.type || "Unknown Type",
      });

      const launch = await Launch.create({
        launchName: item.name || "Unknown Launch",
        programName: item.program?.[0]?.name || "Unknown Program",
        agency: agency._id,
        status: "TBD",
        start: item.window_start || new Date(),
        end: item.window_end || new Date(),
        rocket: rocket._id,
        mission: mission._id,
      });
      
      const populatedLaunch = await Launch.findById(launch._id)
        .populate("agency")
        .populate("rocket")
        .populate("mission");
      
      launches.push(populatedLaunch);
    }

    res.json({
      message: "Launch data saved to MongoDB",
      count: launches.length,
      launches: launches,
    });
  } catch (error) {
    console.error("Error saving launch data:", error.message);
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
      timestamp: data.timestamp,
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

export default router;
