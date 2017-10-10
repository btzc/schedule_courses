$(document).ready(function() {
    $('#calendar').fullCalendar({
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
                title  : 'Dentist',
                start  : '2017-10-09T11:30:00',
                end  : '2017-10-09T12:30:00',
                allDay : false,
                color: 'orange'
            },
            {
                title  : 'Dentist',
                start  : '2017-10-09T11:30:00',
                end  : '2017-10-09T12:30:00',
                allDay : false
            }
        ],
        eventOverlap: true
    });
});