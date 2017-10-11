var express = require('express');
var router = express.Router();
var request = require('request');
var jQuery = require('cheerio');
var async = require('async');

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

var parseCourses = function ( courseObject, term, subjectArray ) {
    var string = courseObject.courseStringData;
    var courses = jQuery(string).find('.ddtitle');
    jQuery(courses).each(function(index) {
        var subjectObject = {};
        var course = courses[index];
        var parent = jQuery(course).closest('tr');
        var table = jQuery(parent).next().find('.datadisplaytable').find('.dddefault');
        if(table.length > 6) {
            var time = jQuery(table)[1].children[0].data;
            var dates = jQuery(table)[2].children[0].data;
            var datesArr = dates.split('');
            subjectObject.time = time;
            subjectObject.dates = datesArr;
        }
        var information = jQuery(course).children().text();
        var split = information.split(' - ');
        if( split.length === 5 ) {
            subjectObject.name = split[0] + ' ' + split[1];
            subjectObject.crn = split[2];
            subjectObject.abbrev = split[3];
            subjectObject.sectionNum = split[4];
        }
        else {
            subjectObject.name = split[0];
            subjectObject.crn = split[1];
            subjectObject.abbrev = split[2];
            subjectObject.sectionNum = split[3];
        }
        subjectObject.cid = subjectObject.abbrev.replace(/ /g,'');
        subjectObject.term = term;
        subjectArray.push(subjectObject);
    });
    return subjectArray;
};

var uniqueSubject = function( subjectObject ) {
    var uniqueList = [];
    for( var i = 0; i < subjectObject.length; i++ ) {
        var item = subjectObject[i].abbrev;
        if( !uniqueList.includes(item) ) {
            uniqueList.push(item);
        }
    }
    return uniqueList;
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
            res.render('index', { title: 'Schedule Courses', 'summer': summer, 'spring': spring, 'fall': fall });
        }
    });
});

router.get('/classes/:term/all', function(req, res, next) {
    var db = req.db;
    var collection = db.get('courses');
    collection.find({term: req.params.term}, {}, function(e, docs) {
        if(e) res.status(404).json({"error":"No results"});
        else res.json(docs);
    });
});

router.get('/classes/:term/:cid', function(req, res, next) {
    var db = req.db;
    var collection = db.get('courses');
    collection.find({term: req.params.term, cid: req.params.cid}, {}, function(e, docs) {
        if(e) res.status(404).json({"error":"No results"});
        else res.json(docs);
    });
});

router.post('/classes/all', function(req, res, next) {
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
        form: form
    };
    request(options, function( error, response, body ) {
        if(!error && response.statusCode === 200) {
            var courses = jQuery(body).find('#subj_id').children();
            var subjects = parseSubjects( courses );

            url = 'https://www.uvic.ca/BAN1P/bwckschd.p_get_crse_unsec';

            var subjectData = [];

            async.each(subjects,
                function(subject, callback) {
                    var data = 'term_in=' + term + '&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sel_subj=' + subject + '&sel_crse=&sel_title=&sel_schd=%25&sel_insm=%25&sel_from_cred=&sel_to_cred=&sel_camp=%25&sel_levl=%25&sel_ptrm=%25&sel_instr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a';
                    options = {
                        url: url,
                        method: 'POST',
                        headers: headers,
                        form: data
                    };
                    var course = {};
                    request(options, function requestCallback( err, res, b ) {
                        if(!err && res.statusCode === 200) {
                            course.subject = subject;
                            course.courseStringData = b;
                            subjectData.push(course);
                            callback();
                        }
                        else if (err) {
                            console.log(err);
                            callback(err);
                        }
                        else {
                            callback('error: status code ' + res.statusCode);
                        }
                    });
                },
                function(err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var subjectParsedData = [];
                        for(var i = 0; i < subjectData.length; i++) {
                            parseCourses(subjectData[i], term, subjectParsedData);
                        }
                        var subjectList = uniqueSubject( subjectParsedData );
                        var db = req.db;
                        var collection = db.get('courses');
                        for(var n = 0; n < subjectParsedData.length; n++) {
                            collection.insert({
                                "cid" : subjectParsedData[n].cid,
                                "time" : subjectParsedData[n].time,
                                "dates" : subjectParsedData[n].dates,
                                "name" : subjectParsedData[n].name,
                                "crn" : subjectParsedData[n].crn,
                                "abbrev" : subjectParsedData[n].abbrev,
                                "sectionNum" : subjectParsedData[n].sectionNum,
                                "term" : subjectParsedData[n].term
                            }, function(err, doc) {
                                if(err){
                                    res.send("Couldn't add to database");
                                }
                                else {
                                    console.log("Successfully added to database");
                                }
                            });
                        }
                    }
                    res.render('classes', { title: 'Express', 'subjectList': subjectList, 'subjectData': subjectParsedData });
                });
        }
    });
});
/*********** ROUTES END **************/

module.exports = router;