# Problem Statement: 

    Usual space missions are not listed to the public as a tracker, but more as a piece of history or news that people can look at.
    It solves this issue using an llm to update space mission logs by pulling api data from nasa and putting it into a database, 
    then using an LLM + agent to pull from the database.
    
# command to install developer dependency(i.e nodemon for instantly reloading changes to the local server)

npm install <--save-dev> nodemon

# How to run express app locally, go to BackendExpressApp directory and run this command

npm run devstart(uses nodemon command, and loads in environment varaible) or npm run start

it should be on localhost port XXXX or whatever is configured in the bin/www file
http://localhost:XXXX/

# Command to run a specific node version using the nvmrc file inside the Backend App

nvm use

# Sources For Project

https://code.visualstudio.com/docs/copilot/customization/mcp-servers
https://www.mongodb.com/docs/mcp-server/configuration/methods/?client=claude-code&deployment-type=atlas
https://expressjs.com/en/resources/middleware/cors/#installation
https://nodejs.org/api/process.html#processenv
https://code.visualstudio.com/docs/reference/variables-reference
https://code.claude.com/docs/en/settings
https://www.youtube.com/watch?v=Coot4TFTkN4&t=57s
https://rapid-agent.devpost.com/details/mongodb-resources
https://expressjs.com/en/guide/database-integration/
https://expressjs.com/en/guide/using-template-engines/
https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/skeleton_website
https://googleapis.dev/nodejs/google-auth-library/5.6.1/
https://github.com/r-spacex/SpaceX-API/blob/master/docs/clients.md
https://publicapis.io/space-x-api
https://auth0.com/blog/url-uri-urn-differences/#What-Is-a-URI-
