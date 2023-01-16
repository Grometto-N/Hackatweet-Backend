const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://admin_NG:EdaVVr5c97NF8ET@cluster0.j9yjyof.mongodb.net/hackatweet";

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))

  .catch((error) => console.error(error));
