let output_video;
const Compress= async(videoPath)=> {
    console.log("videoPath", videoPath);
    
    return new Promise((resolve, reject) => {
    console.log('compress funcrtion is running');
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegPath);

    // var args = process.argv.slice(2);
    // args = ["./public/uploads/(Blue Beetle).mp4"];
    args = [videoPath];
    console.log('args', args);

    function baseName(str) {
        var base = new String(str).substring(str.lastIndexOf('/') + 1)
        if (base.lastIndexOf(".") != -1) {
            base = base.substring(0, base.lastIndexOf("."))
        }
        return base;
    }

    args.forEach(function (val, index, array) {
        var filename = val

        console.log('val', val);//video.mp4

        var basename = baseName(filename)

        console.log('basename', basename);//video

        ffmpeg(filename)
            .output(`./public/compressed/${basename}` + "-720.mp4")
            .videoCodec('libx264')
            .videoBitrate('1400')
            .size('720x1280')

            // ful hd

            // .output(`./public/compressed/${basename}` + "-1080.mp4")
            // .videoCodec('libx264')
            // .videoBitrate('1400')
            // // .noAudio()
            // .size('1080x1920')

            .on('error', function (err) {
                console.log(err);
                reject(err);
            })

            .on('progress', function (progress) {
                console.log('... frames ' + progress.frames);
            })

            .on('end', function () {
                console.log('Finished processing');
                output_video = `/compressed/${basename}` + "-720.mp4";
                console.log('Before replacement:', output_video);

                output_video = output_video.replace(/^\.\/public\/compress-video\/uploads\//, '/');

                console.log('After replacement:', output_video);

                resolve(output_video);
            })

            .run();
    })
});

};
module.exports=
    Compress;
