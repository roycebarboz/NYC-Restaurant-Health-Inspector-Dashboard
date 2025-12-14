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

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
})

app.use('/public', express.static('public'));

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    equals: (a, b) => a === b,
    removeFilter: (filter, removeKey) => {
      const params = new URLSearchParams(filter)
      params.delete(removeKey);
      params.delete('page');
      return params.toString();
    },
    calculateAge: (dateOfBirth) => {
      if (!dateOfBirth) return '';
      const [year, month, day] = dateOfBirth.split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    renderStars: (rating) => {
      if (!rating || rating === 0) return '☆☆☆☆☆';
      const fullStars = Math.floor(rating);
      let stars = '';
      for (let i = 0; i < fullStars; i++) stars += '⭐';
      while (stars.length < 5) stars += '☆';
      return stars;
    },
    countReviewsByRating: (reviews, rating) => {
      if (!reviews || !Array.isArray(reviews)) return 0;
      return reviews.filter(r => r.rating === rating).length;
    },
    getStarCount: (starBreakdown, rating) => {
      if (!starBreakdown) return 0;
      return starBreakdown[rating] || 0;
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