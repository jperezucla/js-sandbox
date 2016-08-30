'use strict';

var moment = require('moment');

function get_formatted_timestamp()
{
    // example: 2015-01-16 22:29:55 GMT+0000 (UTC) This is a log message success="true" host="LAX TERM 1"
    // format: YYYY-mm-dd HH:MM:SS.SSS
    var m = moment();
    var utc_unformatted = m.utc().format();

    var date_split = utc_unformatted.split('T');
    var utc_date = date_split[0];
    var time_split = date_split[1].split('+');
    var utc_time = time_split[0];
    var timezone_offset = time_split[1];

    utc_time = utc_time + '.' + m.millisecond();

    var utc_timestamp = utc_date + ' ' + utc_time + ' +' + timezone_offset + ' (UTC)';

    return utc_timestamp;
}

exports.get_formatted_timestamp = get_formatted_timestamp;
