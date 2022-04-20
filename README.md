
## UserAsk Javascript SDK

**Using UserAsk flows using event loggers**

Step 1: Install Javascript SDK into your codebase using UserAsk's NPM package.

    npm i @userask/js-sdk

Step 2: Create a class for UserAsk and pass the Project ID as constructor arguments.

    import UserAsk from "@userask/js-sdk";
   
    const userask = new UserAsk(`${USERASK_PROJECT_ID}`);

Step 3: Log the event where specified flow needs to triggered using "logEvent" function

    // afterLogin is a user-defined function. 
    function afterLogin() {
    	userask.logEvent("user-login", `${USER_ID}`,  "new user has been logged in");
    }

**Note:**
The logEvent function takes three arguments:
1. Event-Identifier
2. UserID (Fingerprint)
3. Text Data


