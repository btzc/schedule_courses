var express = require('express');
var router = express.Router();
var request = require('request');
var jQuery = require('cheerio');

/*********** CONTROLLER METHODS START **************/
var parseTerms = function( string ) {
    var res = string.split('\n');
    var pattern = new RegExp('ID="term_input_id');
    for(var i = 0; i < res.length; i++) {
        if( res[i].match(pattern) ) {
            return [res[i+2].substring(15, 21), res[i+3].substring(15, 21), res[i+4].substring(15, 21)];
        }
    }
    return res;
};

var parseSubjects = function( string ){
    var subjects = [];
    jQuery(string).each(function(index, course) {
        subjects.push(course.attribs.value);
    });
    return subjects;
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
            var terms = parseTerms( body );
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
    var url = 'https://www.uvic.ca/BAN1P/bwckgens.p_proc_term_date';
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
        form: form,
        json: true
    };
    request(options, function( error, response, body ) {
        if(!error && response.statusCode === 200) {
            body = jQuery(body).find('#subj_id').children();
            var subjects = parseSubjects( body );

            url = 'https://www.uvic.ca/BAN1P/bwckschd.p_get_crse_unsec';
            // var data = 'term_in=' + term + '&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=' + subject + '&sel_crse=&sel_title=&sel_schd=%25&sel_insm=%25&sel_from_cred=&sel_to_cred=&sel_camp=%25&sel_levl=%25&sel_ptrm=%25&sel_instr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a';

            res.send({ title: 'Express' });
        }
    });
});
/*********** ROUTES END **************/

module.exports = router;