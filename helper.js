const { exec } = require("child_process");
const fs = require("fs");
const axios = require('axios');
const FormData = require('form-data');

function convertToWav() {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -y -i input.webm -ar 16000 -ac 1 input.wav', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}


async function transcribeAudio(filePath) {
  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath));

  const res = await axios.post("http://localhost:5000/transcribe/", form, {
    headers: form.getHeaders()
  });

  return res.data.text;
}

module.exports = {convertToWav, transcribeAudio}