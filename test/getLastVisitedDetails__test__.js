const test = require('tape')
const fns = require('../getLastVisitedDetails')
const sample = require('./sample/getLastVisitedDetails_limit1000.json')

const matchStr = 'An item in your cart has become unavailable'

const xtest = (str, callback) => console.log("muted test:", str)

xtest('returns the correct number of visits that contain the passed eventName in an action', (t) => {
    const result = fns.getVisitsWhereEventsNameContains(sample, matchStr)
    t.equal(result.length, 4)
    t.end()
})

xtest('finds actions for the visitor from previous visit logs', (t) => {
    const visitsWithEvents = fns.getVisitsWhereEventsNameContains(sample, matchStr)

    const results = fns.findEarlierVisitLogs(visitsWithEvents, sample)
    t.equal(results.length, 4)
    results.forEach((result, i) => {
        t.equal(result.visitorId, visitsWithEvents[i].visitorId)
        t.equal(result.actionDetails.length, visitsWithEvents[i].actionDetails.length, `length equal for ${result.visitorId}`)
    })
    // t.equal(JSON.stringify(results), {})
    t.end()
})

test('get the closest earlier action given multiple actions before the target action', (t) => {
    const actions = [
        {
            type: 'action',
            pageIdAction: "447",
            timestamp:999
        },
        {
            type: 'action',
            pageIdAction: "23",
            timestamp:998
        },
        {
            type: 'event',
            pageIdAction: "34",
            timestamp:1000
        }
    ]
    const result = fns.getClosestEarlierAction(actions, actions[2])
    t.equal(result.pageIdAction, actions[0].pageIdAction);
    t.end()
})

test("get the page action where the url and timestamp aligns with the event action", (t) => {
    const actions = [
        {
            type: 'action',
            url: "http://www.somewhere.tld/somepage",
            pageIdAction: "221",
        },
        {
            type: 'action',
            url: "http://www.somewhere.tld/someotherpage",
            pageIdAction: "290",
            timestamp: 999,
        },
        {
            type: 'action',
            url: "http://www.somewhere.tld/someotherpage",
            pageIdAction: "288",
            timestamp: 990,
        },
        {
            type: "form",
            pageIdAction: "673",
        },
        {
            type: 'event',
            url: "http://www.somewhere.tld/someotherpage",
            pageIdAction: "344",
            timestamp: 1000,
        }
    ]
    const result = fns.getPageActionForEvent(actions, actions[4])
    t.equal(result.pageIdAction, actions[1].pageIdAction);
    t.end()
});
  
test("get the previous page action based on closest timestamp", (t) => {
    const actions = [
        {
            type: 'action',
            url: "http://www.somewhere.tld/somepage",
            pageIdAction: "221",
            timeSpent: "2",
            timestamp:985
        },
        {
            type: 'action',
            url: "http://www.somewhere.tld/someotherpage",
            pageIdAction: "290",
            timestamp: 999,
        },
        {
            type: 'action',
            url: "http://www.somewhere.tld/someotherpage",
            pageIdAction: "288",
            timestamp: 990,
        }
    ]
    const result = fns.getPreviousPageActionForAction(actions, actions[2])
    t.equal(result.pageIdAction, actions[0].pageIdAction);
    t.end()
});

test(" a verbose event action is slimmed down to specific props", (t) => {
    const action = {
        "type": "event",
        "url": "https://openfoodnetwork.org.au/cart",
        "pageIdAction": "228123",
        "idpageview": "",
        "serverTimePretty": "Jun 22, 2020 20:07:21",
        "pageId": "3163846",
        "eventCategory": "Alert",
        "eventAction": "Error",
        "timeSpent": "103",
        "timeSpentPretty": "1 min 43s",
        "interactionPosition": "1",
        "timestamp": 1592856441,
        "icon": "plugins/Morpheus/images/event.png",
        "iconSVG": "plugins/Morpheus/images/event.svg",
        "title": "Event",
        "subtitle": "Event_Category: \"Alert', Action: \"Error\"",
        "eventName": "An item in your cart has become unavailable. Please update the selected quantities.\\n×",
        "eventValue":1722
    }
    const result = fns.convertToMinimalAction(action);
    t.ok(Object.keys(result).length < Object.keys(action).length)
    t.end()
})

test(" a verbose page action is slimmed down to specific props", (t) => {
    const action = {
        "type": "action",
        "url": "https://openfoodnetwork.org.au/wangaratta-farmers-market-hub/shop",
        "pageTitle": "openfoodnetwork.org.au/Wangaratta Farmers' Market Hub - Open Food Network",
        "pageIdAction": "139481",
        "idpageview": "RkhjKJ",
        "serverTimePretty": "Jun 22, 2020 18:55:45",
        "pageId": "3162474",
        "timeSpent": "809",
        "timeSpentPretty": "13 min 29s",
        "generationTimeMilliseconds": "829",
        "generationTime": "0.83s",
        "interactionPosition": "1",
        "title":"openfoodnetwork.org.au/Wangaratta Farmers' Market Hub - Open Food Network",
        "subtitle": "https://openfoodnetwork.org.au/wangaratta-farmers-market-hub/shop",
        "icon": "",
        "iconSVG": "plugins/Morpheus/images/action.svg",
        "timestamp": 1592852145
    }
    const result = fns.convertToMinimalAction(action);
    t.ok(Object.keys(result).length < Object.keys(action).length)
    t.end()
})

xtest('get previous page with time spent for each instance of an event name per visitor', (t) => {
    const visitsWithEvents = fns.getVisitsWhereEventsNameContains(sample, matchStr)
    const visitLogsWithEarlierActions = fns.findEarlierVisitLogs(visitsWithEvents, sample)
    const results = visitLogsWithEarlierActions.map((visitLog) => fns.getPreviousPageWithTimeSpentForVisitLog(visitLog, matchStr));
    results.forEach((result, i) => {
        t.equal(result, {}, `result for ${result.visitorId}`);
    })
    t.end();
})