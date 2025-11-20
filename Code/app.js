import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

import exphbs from 'express-handlebars';

const staticDir = express.static('public');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    partialsDir: ['views/partials/'],
  // Specify helpers which are only registered on this instance.
    helpers: {}
});

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});