// Require objects.
var express  = require('express');
var app      = express();
var aws      = require('aws-sdk');
var queueUrl = "https://sqs.us-west-2.amazonaws.com/429510590943/node_test";
var receipt  = "arn:aws:sqs:us-west-2:429510590943:node_test";
var appName = '/SQService';
    
// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SQS.
var sqs = new aws.SQS();

// Creating a queue.
app.get(appName+'/create', function (req, res) {
    var params = {
        QueueName: req.query.name
    };
    
    sqs.createQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Listing our queues.
app.get(appName+'/list', function (req, res) {
    sqs.listQueues(function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});


// Sending a message.
// NOTE: Here we need to populate the queue url you want to send to.
// That variable is indicated at the top of app.js.
app.get(appName+'/send', function (req, res) {
    var params = {
        MessageBody: req.query.msg,
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Receive a message.
// NOTE: This is a great long polling example. You would want to perform
// this action on some sort of job server so that you can process these
// records. In this example I'm just showing you how to make the call.
// It will then put the message "in flight" and I won't be able to 
// reach that message again until that visibility timeout is done.
app.get(appName+'/receive', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
    };
    
    sqs.receiveMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Deleting a message.
app.get(appName+'/delete', function (req, res) {
    var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };
    
    sqs.deleteMessage(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Purging the entire queue.
app.get(appName+'/purge', function (req, res) {
    var params = {
        QueueUrl: queueUrl
    };
    
    sqs.purgeQueue(params, function(err, data) {
        if(err) {
            res.send(err);
        } 
        else {
            res.send(data);
        } 
    });
});

// Start server.
var server = app.listen(3200, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SQS Service Started ..');
});