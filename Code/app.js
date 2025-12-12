import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
const app = express();

import configRoutes from './routes/index.js';
import { loggingMiddle, sanitizeData } from './middleware/Auth.js';

app.use(
  session({
    name: "AuthenticationState",
    secret: "Lab10sneaky",
    resave: false,
    saveUninitialized: false
  })
);

const staticDir = express.static('public');

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  // Specify helpers which are only registered on this instance.
  helpers: {
    equals: (a, b) => a === b
  }
});

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(loggingMiddle);
app.use(sanitizeData);
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});