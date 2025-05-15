# Authentication overview
Fabric workloads rely on integration with [Microsoft Entra Id](https://learn.microsoft.com/en-us/entra/fundamentals/whatis) for Authentication and Authorization.  
All interactions between workloads and other Fabric or Azure components must be accompanied with proper authentication support for requests received or sent - tokens sent out must be generated properly and tokens recieved must be validated properly as well.  
It is recommended that you get familiar with [Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/) before starting to work with Fabric workloads.  
Also, it is recommended to go over [Microsoft identity platform best practices and recommendations](https://learn.microsoft.com/en-us/entra/identity-platform/identity-platform-integration-checklist)
## Flows
The blue arrows in the diagram below indicate that the specific communication needs configuring your own AAD app to be done.

![alt text](/photos/dev-mode-schema.png)



### 1. From workload FE to workload BE
An example of such communication is any data plane API- this will be done with a Subject token (Delegated token). 
To be able to acquire a token in the workload FE, please read Authentication API md file, also please make sure you go over token validation in beauth md file.
### 2. From Fabric BE to workload BE
An example of such communication is Create workload item.
This will be done with a SubjectAndApp token, which is a special token that includes an app token and a subject token combined (see beauthdoc.md to learn more about this token).  
For this communication to work, the user using this communication must give consent to the AAD application.
### 3. From workload BE to Fabric BE 
This will be done with a SubjectAndApp for workload control apis, for example ResolveItemPermissions, or with a Subject token for other Fabric APIs.
### 4. From workload BE to external services 
An example of such communication is writing to a lakehouse file.
This will be done with Subject token or an App token depending on the API.
If you plan on communicating with services using a Subject token, make sure you are familiar with [On behalf of flows](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow).



Please refer to setup.md to setup your environment to work with authentication.
