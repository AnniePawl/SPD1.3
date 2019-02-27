// #TODO: Implement authentication controller.
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth.js');
var contentType = require('content-type')

module.exports = app => {

    app.get('/sign-up', (req, res) => {
      // console.log('res locals are: ');
      // console.log(res.locals);
      // const result = {
      //   status: 200,
      //   message: 'curl --cookie-jar cookies.txt -d "{"username":"username", "password":"password"}" -H "Content-Type: application/json" -X POST http://localhost:4040/api/auth/sign-up'
      // };
      // res.json(result);
      res.render('signup.handlebars')
    })

    app.post('/sign-up', (req, res) => {
        const auth = new Auth(req.body);
        auth.save()
            .then((user) => {
              const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '60 days' });
              res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
              res.status(200).json(user.username);
            })
            .catch((err) => {
              res.status(500).json({ status: 500, message: err.message });
            });
    })

    app.get('/login', (req, res) => {
      // const result = {
      //   status: 200,
      //   message: 'curl --cookie-jar cookies.txt -d "{"username":"username", "password":"password"}" -H "Content-Type: application/json" -X POST http://localhost:4040/api/auth/login'
      // };
      // res.json(result);
      res.render('login.handlebars')
    })

    app.post('/login', (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      Auth.findOne({ username }, 'username password')
          .then((user) => {
            if (!user) {
              return res.status(401).json({ message: 'Wrong Username or Password' });
            }

            user.comparePassword(password, (err, isMatch) => {
              if (!isMatch) {
                return res.status(401).json({ message: 'Wrong Username or Password' });
              }
              const token = jwt.sign({ _id: user._id, username }, process.env.JWT_SECRET, { expiresIn: '60 days' });
              res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
              return res.status(200).json(user.username);
            });
            return 0;
          })
          .catch((err) => {
            res.status(500).json({ status: 500, message: err.message });
          });
    })

    app.put('/login', (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      if (!res.locals.currentUser) {
        res.status(401).json({ status: 401, message: 'You are not logged in' });
      }
      if (username === res.locals.currentUser.username) {
        Auth.findOne({ username })
            .then((auth) => {
              auth.password = password;
              const newAuth = new Auth(auth);
              newAuth.save()
                     .then((user) => {
                       const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '60 days' });
                       res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                       res.status(200).json(user.username);
                     })
                     .catch((err) => {
                       res.status(500).json({ status: 500, message: err.message });
                     });
            });
      } else {
        res.status(403).json({ status: 403, message: 'Unauthorized to modify account credentials' });
      }
    })

    app.get('/logout', (req, res) => {
      res.clearCookie('nToken');
      res.status(200).json({ status: 200, message: 'you are now logged out' });
      // res.send('you are now logged out');
    })

    // authController.rootGet = (req, res) => {
    //   if (res.locals.currentUser) {
    //     res.status(200).json({ status: 200, response: req.user.username });
    //   } else {
    //     res.status(401).json({ status: 401, message: 'You are not logged in' });
    //   }
    // };
    //
    // authController.rootDelete = (req, res) => {
    //   Auth.findByIdAndRemove(req.user._id)
    //       .then((user) => {
    //         res.clearCookie('nToken');
    //         res.json(user);
    //       })
    //       .catch((err) => {
    //         res.status(500).json({ status: 500, message: err.message });
    //       });
    // };

}
