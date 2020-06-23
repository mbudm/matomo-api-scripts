require('dotenv').config()
const PiwikClient = require('piwik-client');
const fns =  require('./getLastVisitedDetails');

const myClient = new PiwikClient(process.env.MATOMO_URL, process.env.MATOMO_TOKEN)


matchStr = "An item in your cart has become unavailable"

// get raw visit data - the event api is too limited to map to previous page
myClient.api({
  method:   'Live.getLastVisitsDetails',
  idSite:   3,
  period:   'day',
  date:     'yesterday',
  filter_limit: 1000
}, function (err, responseObject) {
    if(Array.isArray(responseObject)){
        const visitsWithEvents = fns.getVisitsWhereEventsNameContains(responseObject, matchStr)
        console.log("Num visits with Error", visitsWithEvents.length)
        const visitsWithEventsAndEarlierVistLogActions = fns.findEarlierVisitLogs(visitsWithEvents, responseObject)
        const visitsWithEventsPreviousPageTimeSpent = visitsWithEventsAndEarlierVistLogActions.map((visit) => fns.getPreviousPageWithTimeSpentForVisitLog(visit, matchStr))
        console.log("Previous page time spent:", JSON.stringify(visitsWithEventsPreviousPageTimeSpent, null, 2))
    } else if(!err){
        console.log("Response", responseObject)
    } else {
        console.error("Error", err)
    }
});