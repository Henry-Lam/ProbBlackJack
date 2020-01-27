const router = require('express').Router();
let Scoreboard = require('../models/scoreboard.model');

// get request on /exercises/
router.route('/').get((req, res) => {
    Scoreboard.find()
    .then(item => res.json(item)) // find exercises from mongoDB return as json
    .catch(err => res.status(400).json('Error: ' + err));
});

// post request on /exercises/add
router.route('/add').post((req, res) => {
    const username = req.body.username;
    const money = Number(req.body.money); //convert duration to Number object

    const newItem = new Scoreboard({
        username,
        money,
    });

    newItem.save()
    .then(() => res.json('Scoreboard user added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});


// Parameters + delete + update

router.route('/:id').get((req, res) => {
    Scoreboard.findById(req.params.id)
    .then(item => res.json(item))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
    Scoreboard.findByIdAndDelete(req.params.id)
    .then(() => res.json('Scoreboard user deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/update/:id').post((req, res) => {
    Scoreboard.findById(req.params.id)
    .then(item => { // (exercise is the object the database returned)
        item.username = req.body.username;
        item.money = Number(req.body.money);

        item.save()
        .then(() => res.json('Scoreboard user Updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;