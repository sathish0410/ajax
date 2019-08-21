const express = require('express');
var bodyParser = require("body-parser");
const app = express();
var bcrypt = require('bcryptjs');
const path = require('path');
const router = express.Router();
var jwt = require('jsonwebtoken');
var fs = require('fs');
const replaceString = require('replace-string');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myTestDB', {
  useNewUrlParser: true
});
//db connection
var db = mongoose.connection;
db.on('error', function(err) {
  console.log('connection error', err);
});
db.once('open', function() {
  console.log('connected.');
});

var token = jwt.sign({
  name: 'arun'
}, 'error');
console.log('token........', token);
var decoded = jwt.verify(token, 'error');
console.log(decoded);

var decode = jwt.decode(token, {
  complete: true
});
console.log(decode);
console.log('decode......:', decode.payload.name);

//user schema
var user_schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
var user = mongoose.model('user', user_schema);

//product Schema
var product_schema = new mongoose.Schema({
  product_id: Number,
  product_name: String,
  product_owner: String,
  product_owner_id: String,
  product_url: String
});
var product_table = mongoose.model('product', product_schema);



app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/../client/assets/css')));
app.use(express.static(path.join(__dirname + '/../client/assets/js')));

router.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/register.html'));
});

router.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/login.html'));
});

router.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/home.html'));
});

router.get('/product_register', function(req, res) {
  res.sendFile(path.join(__dirname + '/../client/product_register.html'));
});

router.post('/userregister', function(req, res) {
  user.findOne({
    email: req.body.email
  }).exec(function(err, mailcheck) {
    if (err) {
      return res.status(400).end(err);
    }
    if (mailcheck) {
      return res.status(302).end('email already exist');
    }
    console.log(bcrypt.hashSync(req.body.password, 10));
    new user({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }).save(function(err, inserted_data) {
      if (err) {
        return res.status(400).send(err)
      };
      console.log(jwt.sign({
        name: inserted_data._id
      }, 'error'));
      return res.status(200).send(jwt.sign({
        id: inserted_data._id
      }, 'error'));
    });
  });
});

router.post('/userlogin', function(req, res) {
  user.findOne({
    email: req.body.email
  }).exec(function(err, login_check) {
    if (err) return res.status(400).send(err);
    if (!login_check || login_check == 'null') {
      console.log('null');
      return res.status(300).send('invalid email');
    }
    if (!bcrypt.compareSync(req.body.password, login_check.password)) {
      console.log("\n\n\n------login failed-------\n\n");
      return res.status(301).send('invalid password');
    }
    console.log("\n\n\n\nLOGin Success\n\n\n\n\n");
    console.log(jwt.sign({
      name: login_check._id
    }, 'error'));
    return res.status(200).send(jwt.sign({
      id: login_check._id
    }, 'error'));
  });
});

router.get('/getrowcount/:value', function(req, res) {
  console.log('....');
  product_table.find().sort({
    _id: -1
  }).limit(1).exec(function(err, last_row) {
    console.log(last_row);
    if (err) {
      return res.status(400).send(err);
    }
    return res.status(200).send(last_row);
  });
});


router.post('/insert_data', function(req, res) {
  console.log('...insert...');
  console.log('id:', req.body);
  var token = jwt.verify(req.body.product_owner_id, 'error');
  console.log('token....', token.id);
  new product_table({
    product_id: parseInt(req.body.product_id),
    product_name: req.body.product_name,
    product_owner: req.body.product_owner,
    product_owner_id: token.id,
    product_url: req.body.product_url
  }).save(function(err, pro_inserted_data) {
    if (err) return res.status(400).end('db error', err);
    return res.status(200).end('saved in db');
  });
});

router.get('/home_data/:id', function(req, res) {
  console.log('home.......');
  console.log(req.params.id);
  var token = jwt.verify(req.params.id, 'error');
  console.log('.......id::::', token);
  product_table.find({
    product_owner_id: token.id
  }).exec(function(err, product_data) {
    if (err) return res.status(400).send(err);
    console.log(product_data);
    if (product_data.length == 0) {
      return res.status(300).send('no data');
    }
    return res.send(product_data);
  });
});

router.get('/editpage/:id', function(req, res) {
  console.log('.....editpage.......');
  console.log(req.params.id);
  product_table.findOne({
    _id: req.params.id
  }).exec(function(err, product_data) {
    if (err) return res.status(400).end('query not executed');
    if (!product_data) return res.status(302).end('id not found');
    return res.status(200).send(product_data);
  });
});

router.post('/update_data', function(req, res) {
  console.log('...update....:', req.body);
  console.log(req.body.obj_id);
  product_table.updateOne({
    "_id": req.body.obj_id
  }, {
    $set: {
      "product_name": req.body.product_name,
      "product_url": req.body.product_url
    }
  }).exec(function(err, update_check) {
    if (err) return res.status(400).send(err);
    console.log('update_check:', update_check);
    if (update_check.nModified == 0) {
      return res.status(300).send('not updated');
    }
    return res.status(200).send('updated successfully');
  });
});

router.delete('/delete_table', function(req, res) {
  console.log('deletedCount......', req.body);
  console.log('index...', req.body.index);
  console.log('owner_id...', req.body.owner_id);
  product_table.deleteOne({
    "_id": req.body.index,
    "product_owner_id": req.body.owner_id
  }).exec(function(err, delete_check) {
    console.log('--->', delete_check);
    if (err) return res.status(400).send(err)
    if (delete_check.deletedCount == 0) {
      return res.status(300).send('not deleted');
    }
    return res.status(200).send('deleted successfully');
  });
});


app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');