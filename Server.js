//External dependences
var express = require('express');
var app = express();
var fs = require('fs'),
    request = require('request');
var path = require('path');
var exec = require("child_process").exec;
var YouTube = require('youtube-node');
var bodyParser = require('body-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var youTube = new YouTube();
var SpotifyWebHelper = require('@jonny/spotify-web-helper');
var helper = SpotifyWebHelper();
var watson = require('watson-developer-cloud');
var text_to_speech = watson.text_to_speech({
  username: 'YourUsername',
  password: 'YourPassword',
  version: 'v1'
});

app.use(bodyParser.urlencoded({
    extended: false
}))

var spotifyApi = new SpotifyWebApi({
    clientId: 'YourClientID',
    clientSecret: 'YourClientSecret'
});

//Set Static Directory -EJS Template Engine
app.use("/", express.static(__dirname + '/'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//YouTube API Credentials
youTube.setKey('YourYoutubeCredentials');


//Initiate Spotify Helper
helper.player.on('ready', function() {
helper.player.on('play', function() {});
helper.player.on('pause', function() {});
helper.player.on('end', function() {});
helper.player.on('track-change', function(track) {});
helper.player.on('error', function(err) {});
});




//Callable Functions

//Image Downloader
var download = function(uri, filename, callback) {
        request.head(uri, function(err, res, body) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);

            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

var ttsCall = function(text) {
    var params = {
        text: text,
        voice: 'en-GB_KateVoice',
        accept: 'audio/wav'
    };
    text_to_speech.synthesize(params).pipe(fs.createWriteStream('hello_world.wav'));
};




//Routes

    //Home
    app.get('/', function(req, res) {
        res.render('home')
    });
    app.listen(3000);

    //SpotifyControl Routes
    app.post('/SpotifyPlayTrack', function(req, res) {
        console.log('Playing Spotify');
        helper.player.play();
        console.log("Playing")
        res.send('Playing ');
    });

    app.post('/SpotifyPause', function(req, res) {
        helper.player.pause()
        console.log("Paused")
        res.send('Paused');

    });

    app.post('/SpotifyPlay', function(req, res) {
        helper.player.play()
        console.log("Resumed ")
        res.send('Resumed ');
    });

    //Spotify Search 
    app.get('/SpotSearch', function(req, res) {
        resSpot = {query: req.query}
        x = (resSpot["query"]);
        helper.player.pause()
        console.log(x.SpotQuery)
        spotifyApi.searchTracks(x.SpotQuery)
        .then(function(data) {
            console.log(data.body.tracks.items[0].artists[0].name);
            ttsfinal = "Now Playing " + x.SpotQuery + " by " + data.body.tracks.items[0].artists[0].name
            Spoturi = data.body.tracks.items[0].uri
            imageurl = data.body.tracks.items[0].album.images[0].url
            download(imageurl, 'SpotifyCurrent.png', function() {});
            console.log(imageurl)
            ttsCall(ttsfinal);
        }, function(err) {
            console.error(err);
        });

        setTimeout(function() {
            exec("C:\\Users\\UserDir\\Desktop\\VLC\\vlc.exe -Idummy --dummy-quiet --play-and-exit " + '/hello_world.wav');
        }, 1000);

        setTimeout(function() {
                helper.player.play(Spoturi)
        }, 5000);
        res.redirect('/')



//YouTube
    app.get('/YouTubeSearch', function(req, res) {
        response = {
            query: req.query
        }
        x = (response["query"]);
        console.log(x.query)
        youTube.search(x.query, 2, function(error, result) {
            if (error) {
                console.log(error);
            } else {
                x = "https://youtube.com/watch?v="
                y = result.items[0].id.videoId
                console.log("C:\\Users\\bmastrud\\Desktop\\VLC\\vlc.exe --fullscreen " + x + y)
                exec("C:\\Users\\UserDir\\Desktop\\VLC\\vlc.exe --fullscreen " + x + y);
            }
        })
        res.redirect('/')
    });
});
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    //voice params
    
    console.log('Server Success: Listening on ' + add + ':3000');
    var startupscpeech = 'Server Success: Listening on ' + add + ':3000'
    ttsCall(startupscpeech);
})
setTimeout(function() {
    exec("C:\\Users\\UserDir\\Desktop\\VLC\\vlc.exe -Idummy --dummy-quiet --play-and-exit " + '/hello_world.wav');
}, 1500);
