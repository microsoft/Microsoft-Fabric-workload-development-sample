@setlocal
@echo off

rem ------------------------------------------------------------------------------
rem Check the command line
rem ------------------------------------------------------------------------------
if "%~1" == "" (
    goto :Usage
)
if not "%~2" == "" (
    goto :Usage
)


rem ------------------------------------------------------------------------------
rem Set some variable
rem ------------------------------------------------------------------------------
set NSWAG=%~1\Net70\dotnet-nswag.exe
set RUNTIME=Net70
set CONFIG=nswag.json
set INPUT=swagger.json
set OUTPUT=WorkloadAPI_Generated.cs


rem ------------------------------------------------------------------------------
rem Check everything is in place
rem ------------------------------------------------------------------------------

if not exist "%NSWAG%" (
    echo %NSWAG% not found
    goto :Error
)

if not exist "%~dp0%CONFIG%" (
    echo Configuration file %CONFIG% not found in %~dp0
    goto :Error
)

if not exist "%~dp0%INPUT%" (
    echo Input file %INPUT% not found in %~dp0
    goto :Error
)


rem ------------------------------------------------------------------------------
rem Switch to the script directory and execute
rem ------------------------------------------------------------------------------
cd "%~dp0"
%NSWAG% run "%CONFIG%" /variables:Runtime=%RUNTIME%,Input=%INPUT%,Output=%OUTPUT%


echo Done
exit /b 0

:Usage
echo Usage: %~nx0 ^<NSwag installation directory^>
echo In the same directory with this script (%~dp0) you need to have two files:
echo %CONFIG%: the configuration for the code generator
echo %INPUT%: the swagger definition

:Error
exit /b 1
