/**
 * ErrorHandlingController.ts
 * This module provides functions to handle errors in the Workload Client API.
 */

import { 
    ErrorKind, 
    HandleRequestFailureResult, 
    WorkloadClientAPI, 
    WorkloadErrorDetails} 
from "@ms-fabric/workload-client";
import { callDialogOpenMsgBox } from "./DialogController";


/**
 * Calls the 'errorHandling.openErrorDialog' function from the WorkloadClientAPI to open an error dialog.
 *
 * @param {string} errorMessage - The error message to display in the error dialog.
 * @param {string} title - The title of the error dialog.
 * @param {string} statusCode - The status code associated with the error.
 * @param {string} stackTrace - The stack trace information of the error.
 * @param {string} requestId - The unique request ID related to the error.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callErrorHandlingOpenDialog(
    workloadClient: WorkloadClientAPI,
    errorMessage: string,
    title: string,
    statusCode: string,
    stackTrace: string,
    requestId: string) {

    await workloadClient.errorHandling.openErrorDialog({
        errorMsg: errorMessage,
        errorOptions: {
            title,
            statusCode,
            stackTrace,
            requestId,
            errorTime: Date().toString() // Set the timestamp of the error
        },
        kind: ErrorKind.Error
    });
}

/**
 * Calls the 'errorHandling.handleRequestFailure' function from the WorkloadClientAPI to handle request failures.
 *
 * @param {string} errorMessage - The error message associated with the request failure.
 * @param {number} statusCode - The status code of the failed request.
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 */
export async function callErrorHandlingRequestFailure(
    workloadClient: WorkloadClientAPI,
    errorMessage: string,
    statusCode: number,
    ) {

    // the handleRequestFailure API handles MFA errors coming from Fabric. 
    // Such errors are identified by the inclusion of the below text inside the 'body'.
    const errorCodeMFA = "AdalMultiFactorAuthRequiredErrorCode";

    const result: HandleRequestFailureResult = await workloadClient.errorHandling.handleRequestFailure({ status: statusCode, body: errorMessage + errorCodeMFA });
    callDialogOpenMsgBox(workloadClient, "Request Failure handling", `Failure has ${result.handled ? "" : "NOT"} been handled by Fabric`, []);
}

/**
 * Handles errors propagated.
 *
 * @param {any} exception - The exception that we need to handle
 * @param {WorkloadClientAPI} workloadClient - An instance of the WorkloadClientAPI.
 * @param {boolean} isRetry - Indicates that the call is a retry
 * @param {Function} action - The action to retry if the error was handled.
 * @param {...any[]} actionArgs - The arguments to pass to the action.
 * @returns {Promise<any>} - Whether the exception was handled or not.
 */
export async function handleException(
    workloadClient: WorkloadClientAPI,
    exception: any,
    isRetry: boolean = false,
    action: (...args: any[]) => Promise<any>,
    ...actionArgs: any[]
): Promise<any> {
    var parsedException: WorkloadErrorDetails = parseExceptionErrorResponse(exception);
    
    // error could not be handled, show the error dialog
    let message = parsedException?.Message || "Unknown error occurred";
    const errorCode = parsedException?.ErrorCode ?? exception.error?.message?.code;
    let title = getAdditionalParameterValue(parsedException, "title") ?? `Could not handle exception: ${errorCode}`;

    if (exception.error?.message?.code === "PowerBICapacityValidationFailed") { 
        message = `Your workspace is assigned to invalid capacity.\n` +
                  `Please verify that the workspace has a valid and active capacity assigned, and try again.`;
        title = "Power BI Capacity Validation Failed";
    }
    await callErrorHandlingOpenDialog(
        workloadClient,
        message,
        title,
        exception.error?.statusCode,
        exception.response?.stackTrace,
        exception.response?.headers?.requestId
    );
    return null;
}

function getAdditionalParameterValue(parsedException: WorkloadErrorDetails, parameterName: string): string {
    return parsedException?.MoreDetails?.[0]?.AdditionalParameters?.find(ap => ap.Name == parameterName)?.Value;
}

function parseExceptionErrorResponse(exception: any): WorkloadErrorDetails {
    const errorResponse = exception?.error?.message?.["pbi.error"]?.parameters?.ErrorResponse;
    if (!errorResponse) {
        return null;
    }
    return JSON.parse(errorResponse);
}


