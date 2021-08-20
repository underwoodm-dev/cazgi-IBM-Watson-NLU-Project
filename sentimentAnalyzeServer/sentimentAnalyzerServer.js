const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;

    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl: api_url,
    });
    return naturalLanguageUnderstanding;
}

const app = new express();

app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

const naturalLanguageUnderstanding = getNLUInstance();

app.get("/",(req,res)=>{
    res.render('index.html');
});

const getParams = (content) => {
    const analyzeParams = {...{
        "features": {
            "concepts": {},
            "entities": {},
            "keywords": {},
            "categories": {},
            "emotion": {},
            "sentiment": {},
            "semantic_roles": {},
            "syntax": {
                "tokens": {
                    "lemma": true,
                    "part_of_speech": true
                },
                "sentences": true
            }
        },
    }, ...content}
    return analyzeParams
}

app.get("/url/emotion", (req, res) => {
    const url = req.query.url;
    naturalLanguageUnderstanding.analyze(getParams({
            "url": url
        }))
        .then(analysisResults => {
            res.json(analysisResults.result.emotion.document.emotion);
        })
        .catch(err => {
            res.status(400).json({
                "error": 404
            });
        });
});

app.get("/url/sentiment", (req, res) => {
    const url = req.query.url;
    naturalLanguageUnderstanding.analyze(getParams({
            "url": url
        }))
        .then(analysisResults => {
            res.json(analysisResults.result.sentiment.document);
        })
        .catch(err => {
            res.status(400).json({
                "error": 404
            });
        });
});

app.get("/text/emotion", (req, res) => {
    const text = req.query.text;
    naturalLanguageUnderstanding.analyze(getParams({"text": text}))
    .then(analysisResults => {
        res.json(analysisResults.result.emotion.document.emotion);
    })
    .catch(err => {
        res.status(400).json({
            "error": 404
        });
    });
});

app.get("/text/sentiment", (req, res) => {
    const text = req.query.text;
    naturalLanguageUnderstanding.analyze(getParams({
            "text": text
        }))
        .then(analysisResults => {
            res.json(analysisResults.result.sentiment.document);
        })
        .catch(err => {
            res.status(400).json({
                "error": 404
            });
        });
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})
