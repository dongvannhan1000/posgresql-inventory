const express = require('express');
const path = require('path');
const indexController = require('./src/backend/controllers/indexController');
const categoryRoutes = require('./src/backend/routes/categoryRoutes');
const itemRoutes = require('./src/backend/routes/itemRoutes');
const supplierRoutes = require('./src/backend/routes/supplierRoutes');
const createError = require('http-errors');
const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', indexController.getHome);

app.use('/categories', categoryRoutes);
app.use('/items', itemRoutes);
app.use('/suppliers', supplierRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open your browser and visit: http://localhost:${PORT}`);
});

module.exports = app;