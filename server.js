var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var json = require('./movies.json');
var app = express();
var Request = require('request');
const { get } = require('request');

//SETTING UP BASIC CONFIGURATION FOR OUR APP SERVER
app.set('port', process.env.PORT || 3500);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var router = new express.Router();  //CREATING A CUSTOM ROUTER CALLED 'router'

//SETTING UP ENDPOINTS ON 'router'
router.get('/test', function(req, res){
    var data = {
        name: 'Jason Krol',
        website: 'http://Kroltech.com'
    };
    res.json(data);
})

router.get('/', function(req, res){
    res.json(json);
});

router.post('/', function(req, res){
    if(req.body.Id && req.body.Title && req.body.Director && req.body.Year && req.body.Rating){
        json.push(req.body);
        res.json(json);
    }
    else{
        res.status(500).json({error: 'There was an error'});
    }
})

router.get('/external-api', function(req, res){
    Request({
        method: 'GET',
        uri: `http://localhost:${process.env.PORT || 3500}`
    },
    function(err, response, body){
        if(err){
            throw err;
        }
        var movies = [];
        _.each(JSON.parse(body), function(elem, index){
            movies.push({
                title: elem.Title,
                rating: elem.Rating
            })
        })
        res.json(_.sortBy(movies, 'Rating').reverse());
    })

})

router.put('/:id', function(req, res){
    if(req.params.id && req.body.Id && req.body.Title && req.body.Director && req.body.Year && req.body.Rating){
        var checker = 0;
        _.each(json, function(elem, index){
            if(req.params.id === elem.Id){
                checker++;
                elem.Title = req.body.Title
                elem.Director = req.body.Director;
                elem.Year = req.body.Year;
                elem.Rating = req.body.Rating;
            }
        })
        if(checker>0){
            res.json(json);
        }else{
            res.json(500, {error: 'No record was found'})
        }
    }else{
        res.json(500, {error: 'There was an error!'})
    }
})


router.delete('/:id', function(req, res){
    var indexToDel = -1;
    _.each(json, function(elem, index){
        if(elem.Id === req.params.id){
            indexToDel = index;
        }
    });
    if(~indexToDel){
        json.splice(indexToDel, 1);
    }
    res.json(json);
});


/*OR
router.delete('/:id', function(req, res){
    if(req.params.id){
        var checker = [];
        json.forEach(function(elem, index){
            elem.touched = "touched";
            if(elem.Id === req.params.id){
                checker.push(index);
                //json.splice(index, 1)
            }
        })
        if(checker){
            checker.forEach(function(num){
                json.splice(num, 1);
            })
            res.json(json);
        }else{
            res.json(500, {error: 'The document was not found'});
        }
    }
})
*/



app.use('/', router);   //MOUNTING 'router' ON THE '/' ROUTE ON 'app' ('app' IS OUR MAIN ROUTER ON WHICH WE CAN MOUNT MANY CUSTOM ROUTERS)

var server = app.listen(app.get('port'), function(){
    console.log(`Server up: http://localhost:${app.get('port')}`);
})