const express = require('express');

// const { ServerConfig, Logger } = require('./config');   // NOTE :- Without destructuring , error
const { ServerConfig } = require('./config');

const apiRoutes = require('./routes');

const app = express();

app.use('/api', apiRoutes);



app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server with PORT: ${ServerConfig.PORT}`);
    // Logger.info("Successfully started the server");
});