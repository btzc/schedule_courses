$(document).ready(function() {
    var fallSubjectList = [];
    var springSubjectList = [];
    var fallTerm = '201709';
    var springTerm = '201801';
    var inactiveBtn = $('[data-attribute="inactive"]');
    var activeBtn = $('[data-attribute="active"]');
    var fallAddBtn = $('#fall-add');
    var springAddBtn = $('#spring-add');
    var fallTable = $('#fall-table');
    var springTable = $('#spring-table');
    var fallCal = $('#fall-calendar');
    var springCal = $('#spring-calendar');

    fallCal.fullCalendar({
        themeSystem: 'bootstrap3',
        weekends: false,
        header: false,
        defaultView: 'agendaWeek',
        eventLimit: true, // allow "more" link when too many events
        columnFormat: 'ddd',
        locale: 'en',
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '21:00:00',
        events: [
            {
                title  : 'Lawyer',
                start  : '2017-10-09T11:30:00',
                end  : '2017-10-09T12:30:00',
                allDay : false,
                color: 'orange'
            },
            {
                title  : 'Dentist',
                start  : '2017-10-09T12:30:00',
                end  : '2017-10-09T13:30:00',
                allDay : false
            }
        ],
        eventOverlap: true
    });

    springCal.fullCalendar({
        themeSystem: 'bootstrap3',
        weekends: false,
        header: false,
        defaultView: 'agendaWeek',
        eventLimit: true, // allow "more" link when too many events
        columnFormat: 'ddd',
        locale: 'en',
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '21:00:00',
        events: [
            {
                title  : 'Lawyer',
                start  : '2017-10-09T11:30:00',
                end  : '2017-10-09T12:30:00',
                allDay : false,
                color: 'orange'
            },
            {
                title  : 'Lawyer',
                start  : '2017-10-09T12:30:00',
                end  : '2017-10-09T13:30:00',
                allDay : false
            }
        ],
        eventOverlap: true
    });

    selectTerm( activeBtn );
    getCourseList( '201709', fallSubjectList );
    getCourseList( '201801', springSubjectList );

    inactiveBtn.on('click', function() {
        selectTerm( inactiveBtn );
    });
    activeBtn.on('click', function() {
        selectTerm( activeBtn );
    });

    fallAddBtn.on('click', function() {
        addClass( fallAddBtn, fallTerm, fallTable, fallCal );
    });

    springAddBtn.on('click', function() {
        addClass( springAddBtn, springTerm, springTable, springCal );
    });

    $( function() {
        var fallList = fallSubjectList.sort();
        var springList = springSubjectList.sort();
        $( "#fall-classes" ).autocomplete({
            source: fallList
        });
        $( "#spring-classes" ).autocomplete({
            source: springList
        });
    });
});

var uniqueList = function( data, subjectList ) {
    var abbrev = data.abbrev;
    if( !subjectList.includes(abbrev) ) {
        subjectList.push(abbrev);
    }
};

var createEvent = function ( data, cal ) {
    var event={
        title  : 'Lawyer',
        start  : '2017-10-09T12:30:00',
        end  : '2017-10-09T13:30:00',
        allDay : false
    };

    cal.fullCalendar( 'renderEvent', event, true);
};

var createRow = function( data, table ) {
    var tr = document.createElement('tr');

    var td0 = document.createElement('td');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');

    var text0 = document.createTextNode( data.abbrev );
    var text1 = document.createTextNode( data.sectionNum );
    var text2 = document.createTextNode( data.crn );
    var text3 = document.createTextNode( data.time );
    var text4 = document.createTextNode( data.dates );

    td0.appendChild(text0);
    td1.appendChild(text1);
    td2.appendChild(text2);
    td3.appendChild(text3);
    td4.appendChild(text4);

    tr.appendChild(td0);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    table[0].appendChild(tr);
};

var getCourseList = function( term, subjectList ) {
    var getXhr = new XMLHttpRequest();
    getXhr.open("GET", "/classes/" + term + "/all", true);
    getXhr.setRequestHeader("Content-type", "application/json");
    getXhr.onreadystatechange = function () {
        if (getXhr.readyState === XMLHttpRequest.DONE) {
            var data = JSON.parse(getXhr.responseText);
            for (var i = 0; i < data.length; i++) {
                uniqueList(data[i], subjectList);
            }
        }
    };
    getXhr.send();
};

var getCourseData = function( term, cid, table, cal ) {
    var getXhr = new XMLHttpRequest();
    getXhr.open("GET", "/classes/" + term + "/" + cid, true);
    getXhr.setRequestHeader("Content-type", "application/json");
    getXhr.onreadystatechange = function () {
        if (getXhr.readyState === XMLHttpRequest.DONE) {
            var data = JSON.parse(getXhr.responseText);
            for(var i = 0; i < data.length; i++) {
                createRow( data[i], table );
                if( data[i].sectionNum === 'A01' || data[i].sectionNum === 'T01' || data[i].sectionNum === 'B01') {
                    createEvent( data[i], cal );
                }
            }
        }
    };
    getXhr.send();
};

var selectTerm = function( btn ) {
    var active = $('[data-attribute="active"]');
    var springList = $('#spring-search');
    var springTable = $('#spring-table');
    var springClasses = $('#spring-classes');
    var springCal = $('#spring-calendar');
    var fallList = $('#fall-search');
    var fallTable = $('#fall-table');
    var fallClasses = $('#fall-classes');
    var fallCal = $('#fall-calendar');

    springClasses.val('');
    fallClasses.val('');
    active.removeClass('btn-primary');
    active.attr('data-attribute', 'inactive');
    btn.addClass('btn-primary');
    btn.attr('data-attribute', 'active');

    if(active.attr('id') === 'spring') {
        springList.addClass('hidden');
        springTable.addClass('hidden');
        springCal.addClass('hidden');
        fallList.removeClass('hidden');
        fallTable.removeClass('hidden');
        fallCal.removeClass('hidden');
    }
    else {
        springList.removeClass('hidden');
        springTable.removeClass('hidden');
        springCal.removeClass('hidden');
        fallList.addClass('hidden');
        fallTable.addClass('hidden');
        fallCal.addClass('hidden');
    }
};

var addClass = function( btn, term, table, cal ) {
    var subjectList = [];
    var input = btn.prev();
    var cid = input[0].value.replace(/ /g,'');
    var data = table.find('tr');
    $.each(data, function( index ){
        var tr = data[index];
        var value = $(tr).children()[0].innerHTML;
        subjectList.push(value);
    });
    console.log(subjectList);
    if(!subjectList.includes(input[0].value)) {
        getCourseData( term, cid, table, cal );
    }
};