const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const path = require("path");
const Compress = require("./compress");
const port = process.env.PORT || 7000;
const { PassThrough } = require("stream");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);
// const fs = require("fs");

// const fileUpload = require("express-fileupload");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// default options
app.use(express.json());
app.use(fileUpload());

app.post("/", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded");
  }

  const file = req.files.file;
  console.log(file);

  // Get video buffer
  const videoBuffer = file.data;
  const inputStream = new PassThrough();
  inputStream.end(videoBuffer);
  console.log(videoBuffer);

  // count saved folder and create new folder
  function countFolders(directory) {
    try {
      const contents = fs.readdirSync(directory);
      const folders = contents.filter((item) =>
        fs.statSync(directory + "/" + item).isDirectory()
      );
      return folders.length;
    } catch (err) {
      console.error("Error:", err);
      return -1;
    }
  }
  let numFolders = countFolders("public/compressed");
  console.log("numFolders", numFolders);
  numFolders = numFolders + 1;

  let videoFolder = "public/compressed/video_" + numFolders;
  if (!fs.existsSync(videoFolder)) {
    fs.mkdirSync(videoFolder);
  }
  // count saved folder and create new folder " end code "

  let name = "video";

  ffmpeg(inputStream)
    .output(videoFolder + "/" + name + "-720.mp4")
    .videoCodec("libx264")
    .videoBitrate("1400")
    .size("720x1280")

    .output(videoFolder + "/" + name + "-1080.mp4")
    .videoCodec("libx264")
    .videoBitrate("1400")
    .size("1080x1920")

    .on("error", function (err) {
      console.error("Error processing video:", err.message);
      res.status(500).send("Error processing video");
    })
    .on("progress", function (progress) {
      console.log("... frames " + progress.frames);
    })
    .on("end", function () {
      console.log("Video processing completed");
      // Send response indicating successful processing
      let newPath = "../" + videoFolder + "/" + name + "-720.mp4";
      newPath = newPath.replace("/public", "");
      console.log("the path = ", newPath);
      res.render("compressed", { output: newPath });
      // res.send("Video processing completed");
    })
    .run();
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log("test file 1    ");
  res.sendFile(__dirname + "/index.html");
});
app.post("/compress-video/:video_folder/:video_name", async (req, res) => {
  let { video_folder, video_name } = req.params;
  let videoPath = `./public/${video_folder}/${video_name}`;

  let output_path = await Compress(videoPath);
  res.render("compressed", { output: `${output_path}` });

  console.log("hei", videoPath);
});
app.get("/download-video", (req, res) => {
  let { video_name } = req.params;
  res.download("./public/compressed/video-720.mp4");
});

// Set the public path to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log("Lostening to car seller bd to ", port);
});
