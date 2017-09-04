var express = require('express');
var router = express.Router();
var request = require('request');
var json = require('JSON');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/test', function(req, res, next) {
    var url = 'https://www.uvic.ca/BAN2P/bwckschd.p_disp_dyn_sched';
    var options = {
        url: url,
        json: true
    };
    var body = postRequest( options );
    var terms = parseBody( body );
    var subjectList = getSubjectList( terms );

    res.render('index', {title: 'Express' });
});

/*********** CONTROLLER METHODS **************/
var parseBody = function( string ) {
    var res = string.split('\n');
    var pattern = new RegExp('ID="term_input_id');
    for(var i = 0; i < res.length; i++) {
        if( res[i].match(pattern) ) {
            var term = [res[i+2].substring(15, 21), res[i+3].substring(15, 21), res[i+4].substring(15, 21)];
            return term;
        }
    }
    return res;
};

var getSubjectList = function( terms ) {

    for(var term in terms) {
        console.log(term);
        /*var headers = {
            'Content-type': 'application/x-www-form-urlencoded'
        };
        var form = {
            'p_calling_proc': 'bwckschd.p_disp_dyn_sched',
            'p_term': term
        };
        var options = {
            url: url,
            method: 'POST',
            headers: headers,
            form: form
        };*/
    }
};

var postRequest = function( options ) {
    var respbody;
    request(options, function( error, response, body ) {
        if(!error && response.statusCode === 200) {

        }
    });
    return respbody;
};

module.exports = router;