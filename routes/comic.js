const request = require("request");
const express = require("express");
const router = express.Router();

/*
 * Fetches the number of the latest XKCD comic
 * @param {function(int)} callback - A callback function to call after the latest comic has been fetched.
 */
function getLatest(callback) {
    "use strict";
    const addr = "https://xkcd.com/info.0.json";
    request(addr, {json: true}, function onGetLatest(err, res, body) {
        let latestNum;
        if (err) {
            latestNum = 0;
        } else {
            latestNum = body.num;
        }
        callback(latestNum);
    });
}

/*
 * Iterative function that fetches the details for `limit` unique random comics
 * @param {int} max - The latest comic that can fetched
 * @param {int} limit - The number of unique comics to be fetched
 * @param {function(array)} callback - A callback function to call after fetching enough comics
 * @param {array} comics - The comic details fetched so far
 * @param {array} chosen - The comic numbers that have already been included in `comics`
 */
function getRandomComics(max, limit = 1, callback, comics = [], chosen = []) {
    if (chosen.length >= limit) {
        callback(comics);
        return;
    }
    const nextComic = Math.ceil(Math.random() * max);
    if (chosen.indexOf(nextComic) > -1) {
        return getRandomComics(max, limit, callback, comics, chosen);
    }
    chosen.push(nextComic);
    request(`https://xkcd.com/${nextComic}/info.0.json`, {json: true}, function onGetComic(err, ignore, body) {
        let comic;
        if (err) {
            comic = {
                num: "?",
                title: "Error",
                alt: "error"
            };
        } else {
            comic = {
                num: body.num,
                title: body.title,
                alt: body.alt
            };
        }
        comics.push(comic);
        getRandomComics(max, limit, callback, comics, chosen);
    });
}

/* GET JSON array of details for up to {limit} random XKCD comics */
router.get("/random/:limit", function (req, res) {
    "use strict";
    let limit = req.params.limit;
    if (Number.isNaN(limit) || limit < 1) {
        res.status(400);
        res.json({
            success: false,
            error: "Invalid limit given"
        });
        return;
    }
    getLatest(function (latestNum) {
        if (latestNum === 0) {
            res.status(500);
            res.json({
                success: false,
                error: "Failed to find latest comic"
            });
            return;
        }
        if (latestNum < limit) {
            limit = latestNum;
        }
        getRandomComics(latestNum, limit, function onGetRandomComics(comics) {
            res.json({comics});
        });
    });
});

/* GET associated image from XKCD for comic {num} */
router.get("/image/:num", function (req, res) {
    "use strict";
    request(`https://xkcd.com/${req.params.num}/info.0.json`, {json: true}, function onGetComic(err, ignore, body) {
        if (err) {
            res.status(500);
            return;
        }
        request(body.img).pipe(res);
    });
});

module.exports = router;
