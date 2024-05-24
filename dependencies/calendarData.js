function doGet(request) {
  eval(UrlFetchApp.fetch('https://momentjs.com/downloads/moment.js').getContentText())
  const calendarId = request.parameters.key

  var result;
  const optionalArgs = {
    timeMin: moment().subtract(1, 'months').toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 300,
    timezone: 'UTC',
    orderBy: 'startTime'
  };


  try {
    const response = Calendar.Events.list(calendarId, optionalArgs);

    if (response.items.length === 0) {
      console.log('No upcoming events found');
      return;
    }
    result = response.items.reduce((acc, event) => {
      if (!event.summary.match(/[0-9]-[0-9]{13}/)) return acc
      let attendee_emails = event.attendees.reduce((acc, attendee) => {
        return (attendee.email.includes('@google.com') ? acc : [...acc, attendee.email])
      }, [])
      let phone = Object.values({
        es: event.description.replace(/<[^>]*>/g, '').match(/(?<=indicaste, |indicaste ).*?(?= en)/),
        pt: event.description.replace(/<[^>]*>/g, '').match(/(?<=informou, |informou ).*?(?= na)/)
      })

      return [...acc, {
        "case_id": event.summary.match(/[0-9]-[0-9]{13}/)[0],
        "appointment": event.start.dateTime,
        "phone": phone.find((arr) => Array.isArray(arr))[0],
        "attendees": attendee_emails,
        "meet": event.hangoutLink
      }]
    }, [])

    result = { data: result }

  }
  catch (err) { console.log(err.message) }

  return ContentService.createTextOutput(request.parameters.portal + '(' + JSON.stringify(result) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
}  
