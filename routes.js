const router = require('express').Router()
const path   = require("path")
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const https = require('https')
const fileUrl = 'https://res.cloudinary.com/mdfchucknorris/video/upload/v1515146607/Funny_Cat_Videos_-_1_minute_Watch_it___drcror.mp4'

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH)

module.exports = io => {

  router.get('/download-and-encode', (req, res, next) => {
      let file = fs.createWriteStream("video1.mp4")

      file
        .on("close", function(ex) {
          ffmpeg('./video1.mp4')
            .outputOptions([
              '-acodec libvorbis',
              '-vcodec libvpx-vp9',
              '-quality realtime',
              '-cpu-used 7',
            ])
            .output('video1.webm')
            .on('start', () => {
              console.log('Relax! FFMPEG is doing all the hard work')
            })
            .on('progress', function(progress) {
                console.log(progress.percent)
                io.emit('transcoding', {progress: progress.percent })
            })
            .on('error', (err) => {
              console.error(err)
            })
            .on('end', () => {
              io.emit('end')
              res.sendFile(path.join(__dirname+'/video1.webm'))
            })
            .run()
        })

      https.get(fileUrl, function(response) {
        let body = ""
        let cur = 0
        let len = parseInt(response.headers['content-length'], 10)
        response.pipe(file)
        response.on("data", function(chunk) {
          cur += chunk.length
          io.emit('download', {progress: (100.0 * cur / len).toFixed(2)})
        })
      })
  })
    return router
}
