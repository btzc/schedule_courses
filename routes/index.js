var express = require('express');
var router = express.Router();
var request = require('request');
var json = require('JSON');
var handlebars = require('handlebars');

/*********** CONTROLLER METHODS START **************/
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
/*********** CONTROLLER METHODS END **************/

/*********** ROUTES START **************/
router.get('/', function(req, res, next) {
    var url = 'https://www.uvic.ca/BAN2P/bwckschd.p_disp_dyn_sched';
    var options = {
        url: url
    };
    request(options, function( error, response, body ) {
        if(!error && response.statusCode === 200) {
            var terms = parseBody( body );
            var fall, spring, summer;
            for(var i = 0; i < terms.length; i++) {
                if (terms[i].substring(4, 6) === '01') {
                    spring = terms[i];
                }
                else if (terms[i].substring(4, 6) === '05') {
                    summer = terms[i];
                }
                else if (terms[i].substring(4, 6) === '09') {
                    fall = terms[i];
                }
                else {
                    console.log('An error has occurred');
                }
            }
            res.render('index', { title: 'Express', 'summer': summer, 'spring': spring, 'fall': fall });
        }
    });
});

router.post('/test', function(req, res, next) {
    var term = req.body.select_term;
    console.log(term);
    var headers = {
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
    };
});
/*********** ROUTES END **************/

module.exports = router;