const express = require('express');
const router = express.Router();

// 首页
router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// 搜索页：GET /restaurants
router.get('/restaurants', (req, res) => {
  // 现在先给前端一个空页面，将来这里会从数据库拿数据
  res.render('restaurants/search', {
    title: 'Search restaurants'
    // 将来可以传 query: req.query, restaurants: [...]
  });
});

// 登录页
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Log In' });
});

// 注册页
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.get('/restaurants/:id', (req, res) => {
  // 临时假数据，方便你看 UI 效果
  const restaurant = {
    _id: req.params.id,
    name: "Demo Pizza Place",
    cuisine: "Pizza",
    borough: "Manhattan",
    address: "123 Broadway, New York, NY",
    phone: "(212) 555-1234",
    currentGrade: "A",
    score: 12,
    lastInspectionDate: "2024-01-15"
  };

  const inspections = [
    { date: "2024-01-15", grade: "A", score: 12, summary: "No critical violations." },
    { date: "2023-07-10", grade: "B", score: 18, summary: "Minor issues corrected on site." }
  ];

  const violations = [
    { date: "2023-07-10", code: "10F", description: "Non-food contact surface not properly maintained." },
    { date: "2022-11-03", code: "08A", description: "Facility not vermin proof." }
  ];

  const reviews = [
    { username: "Alice", rating: 5, date: "2024-02-01", comment: "Very clean and tasty." },
    { username: "Bob", rating: 4, date: "2024-02-10", comment: "Good food, a bit crowded." }
  ];

  res.render('restaurants/detail', {
    title: 'Restaurant details',
    restaurant,
    inspections,
    violations,
    reviews,
    avgRating: 4.5
  });
});


router.post('/login', (req, res) => {
  res.send("Login POST received (backend logic not implemented yet)");
});

router.post('/register', (req, res) => {
  res.send("Register POST received (backend logic not implemented yet)");
});

module.exports = router;
