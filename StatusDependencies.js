﻿exports.newStatusDependencies = function newStatusDependencies(BOT, logger, STATUS_REPORT, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const MODULE_NAME = "Status Dependencies";

    let bot = BOT 

    let thisObject = {
        nodeArray: undefined,
        statusReports: new Map(),
        initialize: initialize,
        keys: []
    };

    return thisObject;

    function initialize(pMonth, pYear, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            /* Basic Valdidations */
            if (bot.processNode.referenceParent.processDependencies !== undefined) {
                if (bot.processNode.referenceParent.processDependencies.statusDependencies !== undefined) {
                    thisObject.nodeArray = bot.processNode.referenceParent.processDependencies.statusDependencies
                } else {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have status dependencies at all.");
                    callBackFunction(global.DEFAULT_OK_RESPONSE)
                    return
                }
            } else {
                logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> It is not possible to not have process dependencies, which means not status dependencies.");
                callBackFunction(global.DEFAULT_OK_RESPONSE)
                return
            }

            /*For each dependency we will initialize the status report, and load it as part of this initialization process.*/

            let alreadyCalledBack = false;
            let loadCount = 0;

            for (let i = 0; i < thisObject.nodeArray.length; i++) {

                let statusReportModule = STATUS_REPORT.newStatusReport(BOT, logger, UTILITIES);

                logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Initializing Status Report # " + (i + 1));
                statusReportModule.initialize(thisObject.nodeArray[i], pMonth, pYear, onInitilized);

                function onInitilized(err) {

                    logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Initialized Status Report # " + (i + 1));

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        if (alreadyCalledBack === false) {
                            logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err = " + err.stack);
                            logger.write(MODULE_NAME, "[ERROR] initialize -> onInitilized -> err.message = " + err.message);
                            alreadyCalledBack = true;
                            callBackFunction(err);
                        } else {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] initialize -> Can not call back because I already did."); }
                        }
                        return;
                    }

                    logger.write(MODULE_NAME, "[INFO] initialize -> onInitilized -> Loading Status Report # " + (i + 1));
                    statusReportModule.load(onLoad);
                }

                function onLoad(err) {

                    try {
                        logger.write(MODULE_NAME, "[INFO] initialize -> onLoad -> Loaded Status Report # " + (i + 1));
                        statusReportModule.status = err.message;

                        switch (err.message) {
                            case global.DEFAULT_OK_RESPONSE.message: {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> onLoad -> Execution finished well. -> Status Dependency = " + JSON.stringify(thisObject.nodeArray[i])) }

                                addReport();
                                return;
                            }
                            case "Status Report was never created.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> Status Dependency = " + JSON.stringify(thisObject.nodeArray[i]))

                                addReport();
                                return;
                            }

                            case "Status Report is corrupt.": {

                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[WARN] initialize -> onLoad -> Report Not Found. -> Status Dependency = " + JSON.stringify(thisObject.nodeArray[i]))

                                addReport();
                                return;
                            }
                            default:
                                {
                                    logger.write(MODULE_NAME, "[ERROR] initialize -> onLoad -> Operation Failed.");

                                    if (alreadyCalledBack === false) {
                                        alreadyCalledBack = true;
                                        callBackFunction(err);
                                    }
                                    return;
                                }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> onLoad -> err = "+ err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function addReport() {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Entering function."); }
                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Adding Status Report # " + (i + 1));

                    loadCount++;
                    logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Total Added = " + loadCount);

                    let key;

                    if (thisObject.nodeArray[i].processRunMonthly === true) {
                        key = thisObject.nodeArray[i].devTeam + "-" + thisObject.nodeArray[i].bot + "-" + thisObject.nodeArray[i].process + "-" + thisObject.nodeArray[i].dataSetVersion + "-" + pYear + "-" + pMonth;
                    } else {
                        key = thisObject.nodeArray[i].devTeam + "-" + thisObject.nodeArray[i].bot + "-" + thisObject.nodeArray[i].process + "-" + thisObject.nodeArray[i].dataSetVersion;
                    }

                    thisObject.keys.push(key);
                    thisObject.statusReports.set(key, statusReportModule);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> addReport -> Report added to Map. -> key = " + key); }

                    if (loadCount === thisObject.nodeArray.length) {
                        if (alreadyCalledBack === false) {
                            alreadyCalledBack = true
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        } else {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] initialize -> addReport -> Can not call back because I already did."); }
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
