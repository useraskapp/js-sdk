## UserAsk Javascript SDK

**Using UserAsk flows using event loggers**

Step 1: Install Javascript SDK into your codebase using UserAsk's NPM package.

    npm i @userask/js-sdk

Step 2: Create a class for UserAsk and initialize the object.

    import UserAsk from "@userask/js-sdk";
   
    const userask = new UserAsk();

    userask.init({
        projectId: ${YOUR_PROJECT_ID},
        userId: ${YOUR_USER_ID},
        userMeta: ${USER_METADATA}
    })


Step 3: Show Flow where specified flow needs to triggered using "showSurvey" function

    // afterLogin is a user-defined function. 
    function afterLogin() {
    	userask.showSurvey("user-login");
    }

**Note:**
The showSurvey function takes argument:
1. Flow-Identifier
