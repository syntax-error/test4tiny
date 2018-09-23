const request = require("request");
const express = require("express");
const router = express.Router();

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

/* GET users listing. */
router.get("/random/:limit", function (req, res) {
    "use strict";
    getLatest(function (latestNum) {
        if (latestNum === 0) {
            res.status(500);
            res.json({
                success: false,
                error: "Failed to find latest comic"
            });
            return;
        }
        getRandomComics(latestNum, req.params.limit, function onGetRandomComics(comics) {
            res.json({comics});
        });
    });
});

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
