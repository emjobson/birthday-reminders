import * as _ from 'lodash';

/*
 * Takes in a string representing iCal events.
 * 
 * Events represented as such:
 * 
    BEGIN:VEVENT
    DTSTART:20190306
    SUMMARY:Marshall Jackson Glover's birthday
    RRULE:FREQ=YEARLY
    DURATION:P1D
    UID:b1513983572@facebook.com
    END:VEVENT
 *
 * Returns map of name -> bday (string in format YYYYMMDD)
 */
export function parseICal(ical) {
  const lines = ical.split('\n');
  const filtered = lines.filter(line => {
    const label = line.split(':')[0];
    return label === 'DTSTART' || label === 'SUMMARY';
  });
  const divided = _.partition(
    filtered,
    line => line.split(':')[0] === 'SUMMARY'
  );
  return _.zipObject(
    divided[0].map(line => line.split(':')[1].slice(0, -12)),
    divided[1].map(line => line.split(':')[1])
  );
}
