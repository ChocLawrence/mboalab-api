const constants = require("../constants");
const mongodb = require("mongodb");
const crypto = require("crypto");
const fs = require("fs");
const ejs = require("ejs");
const moment = require("moment");
const binary = mongodb.Binary;
const path = require("path");
const ObjectId = require('mongodb').ObjectID;

//axios configurations
const axios = require("axios");

module.exports = {
  fs,
  binary,
  ejs,
  path,
  axios,
  crypto,
  moment,
  ObjectId,
};
