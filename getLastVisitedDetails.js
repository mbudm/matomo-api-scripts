const getVisitsWhereEventsNameContains = (visitResults, eventNameMatch) => {
    return visitResults.filter((visit) => findEventByEventNameMatch(visit.actionDetails, eventNameMatch));
}

const findEventByEventNameMatch = (actions, eventNameMatch) => {
    const regex = new RegExp(eventNameMatch,"gm");
    return actions.find((action) => action.type == "event" && action.eventName.match(regex))
}

const findEarlierVisitLogs = (visitLogs, sourceVisitLogs) => {
    return visitLogs.map((visitLog) => {
        const earlierActionDetails= sourceVisitLogs.filter((sourceVisitLog) => {
                return sourceVisitLog.visitorId === visitLog.visitorId && 
                sourceVisitLog.lastActionTimestamp <= visitLog.firstActionTimestamp
            })
            .map((earlierVisitLog) => earlierVisitLog.actionDetails)
            .flat();

        return {
            ...visitLog,
            actionDetails: earlierActionDetails.concat(visitLog.actionDetails)
        }
    })
}

const getClosestEarlierAction = (actions, targetAction) => {
    return actions.reduce((closestAction, action) => {
        return (targetAction.timestamp - closestAction.timestamp) > (targetAction.timestamp - action.timestamp) 
            && targetAction.pageIdAction !== action.pageIdAction ?
            action :
            closestAction;
    }, {timestamp:0})
}
const getPageActionForEvent = (actions, eventAction) => {
    const actionsMatchingUrl = actions.filter((action) => action.type === 'action' && action.url && action.url === eventAction.url)
    return getClosestEarlierAction(actionsMatchingUrl, eventAction)
}

const getPreviousPageActionForAction = (actions, eventPageAction) => {
    const pageActionsWithTimeSpentProp = actions.filter((action) => action.url && action.type === "action" && action.timeSpent)
    return getClosestEarlierAction(pageActionsWithTimeSpentProp, eventPageAction)
}

const convertToMinimalAction = (action) => {
    const props = ["type","url", "pageTitle', timeSpent", "timeSpentPretty", "eventCategory", "eventAction", "eventName", "eventValue", "timestamp"];
    return props.reduce((obj, prop) => {
        return action[prop] ?
            {...obj, [prop]: action[prop]} :
            obj;
    }, {});
}

const getPreviousPageWithTimeSpentForVisitLog = (visitLog, eventNameMatch) => {
    const eventAction = findEventByEventNameMatch(visitLog.actionDetails, eventNameMatch)
    const eventPageAction = getPageActionForEvent(visitLog.actionDetails, eventAction)
    const eventPreviousPageAction = getPreviousPageActionForAction(visitLog.actionDetails, eventPageAction)
    return {
        visitorId: visitLog.visitorId,
        eventAction: convertToMinimalAction(eventAction),
        eventPageAction: convertToMinimalAction(eventPageAction),
        eventPreviousPageAction: convertToMinimalAction(eventPreviousPageAction),
    }
}


module.exports = {
    getVisitsWhereEventsNameContains,
    findEarlierVisitLogs,
    getPreviousPageWithTimeSpentForVisitLog,
    getClosestEarlierAction,
    getPageActionForEvent,
    getPreviousPageActionForAction,
    convertToMinimalAction
}