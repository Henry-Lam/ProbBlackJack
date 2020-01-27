const router = require('express').Router();
let User = require('../models/user.model');

// root of this file is /users
// get request on /users/
router.route('/').get((req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));

    // .find() is a mongoose method --> gets all users from mongodb ATLAS database
    // .then() takes those users and returns res.json(users) (those users in json format)
    // .catch() catches errors
});

// post request on /users/add
router.route('/add').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const money = 0;
    const newUser = new User({username, password, money});

    // save users to database
    newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
    User.findById(req.params.id)
    .then(item => {
        item.money = Number(req.body.money);

        item.save()
        .then(() => res.json('User Money Updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
})


module.exports = router;