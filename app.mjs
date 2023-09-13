// app.mjs
import express from 'express';
import path from 'path';
import url from 'url';
import hbs from 'hbs';
import fs from 'fs'; 
import {Kaomoji} from './kaomoji.mjs';
import session from 'express-session';

const app = express();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({extended: true}));
let kaomojis = [];

const sessionOptions = {
    secret: "kmji",
    resave: true,
    saveUninitialized: true
  };
app.use(session(sessionOptions));

fs.readFile('code-samples/kaomojiData.json', 'utf-8', (err, data) =>{
    if(err){
        console.log(err);
        process.exit();
    }
    else{
        const content = JSON.parse(data);
        kaomojis = content.map(content => new Kaomoji(content.value, content.emotions));
        console.log(kaomojis);
        app.listen(3000, () =>{
            console.log(`Server started; type CTRL+C to shut down`);
        });
    }
});

//Logs every request
app.use((req, res, next) =>{
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(JSON.stringify(req.query).replace(/"([^"]+)":\s*"([^"]+)"/g, "$1: '$2'")); //formats query in form {key: 'value'}
    next();
});

app.post('/', (req, res) =>{
    const message = req.body.message;
    const words = message.split(' ');
    for(let i = 0; i < words.length; i++){
        for(let j = 0; j < kaomojis.length; j++){
            if(kaomojis[j].emotions.includes(words[i].toLowerCase())){
                words[i] = kaomojis[j].value;
            }
        }
    }
    const edited = words.join(' ');//reconstructing sentence
    res.render('editor', {message: message, edited: edited});
});

app.post('/dictionary', (req, res) =>{//when adding new kaomoji
    const emotionsArray = req.body.emotions.split(',');
    const newK = new Kaomoji(req.body.value, emotionsArray);
    req.session.count = (req.session.count|| 0) + 1;
    kaomojis.push(newK);
    res.render('dictionary', {kaomojis: kaomojis});
});

app.get('/stats', (req, res) =>{
    const ct = req.session.count || 0;
    res.render('stats', {count:ct});
  });  

//Route for root URL
app.get('/', (req, res) =>{
    res.redirect('/editor');
});

app.get('/editor', (req, res) =>{
    res.render('editor');
});

app.get('/dictionary', (req, res) =>{
    const query = req.query.emotion;
    let kaomojisQuery = kaomojis;
    if (query){
        kaomojisQuery = kaomojis.filter(kaomoji => kaomoji.isEmotion(query));
    }
    res.render('dictionary', {kaomojis: kaomojisQuery});
});



