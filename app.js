const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();

// 让 Express 可以解析 POST 表单
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 设置静态档案路径
app.use(express.static(path.join(__dirname, 'public')));

// 设置 Handlebars
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    ifEquals: function (a, b, options) {
      return a == b ? options.fn(this) : options.inverse(this);
    }
  }
}));


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// 监听端口
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
