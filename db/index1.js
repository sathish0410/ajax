var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myTestDB', {
  useNewUrlParser: true
});
//connection
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('connection error', err);
});
db.once('open', function() {
  console.log('connected.');
});

var user_schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

var user = mongoose.model('user', user_schema);

var query = user.find({
  email: 'test@gmail.com'
});
query.exec(function(err, docs) {
  if (err) console.log(err);
  console.log(docs.length);
});

// var u = new user;
// u.name = 'test';
// u.email = 'test@gmail.com';
// u.password = '1234@test';
// u.save();