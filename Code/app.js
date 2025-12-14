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

app.use((req,res,next) =>{
  res.locals.user = req.session.user || null;
  next();
})

const staticDir = express.static('public');
app.use('/public', staticDir);

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    equals: (a, b) => a === b,
    removeFilter: (filter, removeKey) => {
      const params= new URLSearchParams(filter)
      params.delete(removeKey);
      params.delete('page');
      return params.toString();
    }
  }
});

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