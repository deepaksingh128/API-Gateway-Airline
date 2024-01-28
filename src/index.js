const express = require('express');
const rateLimit = require('express-rate-limit');
// const { ServerConfig, Logger } = require('./config');   // NOTE :- Without destructuring , error
const { ServerConfig } = require('./config');
const { createProxyMiddleware } = require('http-proxy-middleware');

const apiRoutes = require('./routes');

const app = express();

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,   // 2 minutes
    max: 3                    // limit each IP to 3 requests per window (here , per 2 minutes)
})



app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(limiter);

app.use('/flightsService', createProxyMiddleware({ 
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true, 
    pathRewrite: {'^/flightsService': '/'}}));
app.use('/bookingService', createProxyMiddleware({ 
    target: ServerConfig.BOOKING_SERVICE, 
    changeOrigin: true, 
    pathRewrite: {'^/bookingService': '/'}}));

app.use('/api', apiRoutes);



app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server with PORT: ${ServerConfig.PORT}`);
    // Logger.info("Successfully started the server");
});

/**
 * user
 * |
 * v
 * localhost:5000  ( API Gateway ) -> localhost:4000/api/v1/bookings
 * |
 * v
 * localhost:3000/api/v1/flights
 */