require("dotenv").config();

var keys = require("./keys");
var Spotify = require("node-spotify-api");
var request = require("request");
var moment = require("moment");
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var writeToLog = function(data) {
    fs.appendFile("log.txt", JSON.stringify(data) + "\n", function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Updated log.txt");
    });
};

var getArtistNames = function(artist) {
    return artist.name;
};

var getMeSpotify = function(songName) {
    if (songName === undefined) {
        songName = "Hammer Smashed Face";
    }

    spotify.search({ type: "track", query: songName }, function(err,data) {
        if (err) {
            console.log("ERROR " + err);
            return;
        }

    var songs = data.tracks.items;
    var data = [];
    
    for (var i = 0; i < songs.length; i++) {
        data.push({
            "artist: ": songs[i].artists.map(getArtistNames),
            "song name: ": songs[i].name,
            "preview song: ": songs[i].preview_url,
            "album: ": songs[i].album.name
        });
    }
    console.log(data);
    writeToLog(data);
  });
};

var getMyBands = function(artist) {
    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    request(queryURL, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var jsonData = JSON.parse(body);

            if (!jsonData.length) {
                console.log("No results for " + artist);
                return;
            }
            var logData = [];

            logData.push("Upcoming Concerts for " + artist + ":");

            for (var i = 0; i < jsonData.length; i++) {
                var show = jsonData[i];

                logData.push(
                    show.venue.city +
                    "," +
                    (show.venue.region || show.venue.country) +
                    " at " +
                    show.venue.name +
                    " " +
                    moment(show.datetime).format("MM/DD/YYYY")
                );
            }

            console.log(logData.join("\n"));
            writeToLog(logData.join("\n"));
        }

    });
};

var getMeMovie = function(movieName) {
    if (movieName === undefined) {
        movieName = "Mr Nobody";
      }
    
      var urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=trilogy";
    
    request(urlHit, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var jsonData = JSON.parse(body);
        var data = {
            "title: ": jsonData.Title,
            "year: ": jsonData.Year,
            "rated: ": jsonData.Rated,
            "IMDB rating: ": jsonData.imdbRating,
            "country: ": jsonData.Country,
            "language: ": jsonData.Language,
            "plot: ": jsonData.Plot,
            "actors: ": jsonData.Actors,
            "RT rating: ": jsonData.Ratings[1].Value
        };

        console.log(data);
        writeToLog(data);
    }
  });
};

var doWhatItSays = function() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        console.log(data);
        var dataArr = data.split(",");
        if (dataArr.length === 2) {
            pick(dataArr[0], dataArr[1]);
        }
        else if (dataArr.length === 2) {
            pick(dataArr[0]);
            }
        
    });
};

var pick = function(caseData, functionData) {
    switch (caseData) {
        case "concert-this":
        getMyBands(functionData);
        break;
        case "spotify-this-song":
        getMeSpotify(functionData);
        break;
        case "movie-this":
        getMeMovie(functionData);
        break;
        case "do-what-it-says":
        doWhatItSays();
        break;
        default:
        console.log("Liri hurts itself in its confusion!");
    }
};

var runThis = function(argOne, argTwo) {
    pick(argOne, argTwo);
};

runThis(process.argv[2], process.argv.slice(3).join(" "));
