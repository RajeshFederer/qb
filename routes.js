var express = require('express');
var router = express.Router();
var request = require('request');
var config = require("./config");

router.get('/', function (req, res) {
	res.redirect("/index.html");
});

router.get('/chat', function (req, res) {
	res.redirect('/chat.html');
});

router.post('/dialogflowAPI', function (req, res) {
	var options = {
		method: 'POST',
		url: config.dialogflowAPI,
		headers: {
			"Authorization": "Bearer " + config.accessToken
		},
		body: req.body,
		json: true
	};
	request(options, function (error, response, body) {
		if (error) {
			res.json({ error: "error in chat server api call" }).end();
		} else {
			if(body.result && body.result.action && body.result.action =="riskClass"){
				
				let riskClass = body.result.parameters && body.result.parameters.RiskClass ? body.result.parameters.RiskClass : null;
				console.log('YEAH', riskClass, body.result.parameters);
				if(riskClass){

					var options = {
						method: 'POST',
						url: "http://10.76.1.53:7999/aa/industry",
						headers: {},
						body: {"code": riskClass},
						json: true
					};
					request(options, function (error, response, responseBody) {
						if (error) {
							console.log('ERROR IN GUIDEWIRE API CALL');
							res.json(body).end();
						} else {
							console.log('SUCCESS IN GUIDEWIRE API CALL', response, responseBody);
							if(responseBody && responseBody.description){
								body.result.fulfillment.messages[0].speech = body.result.fulfillment.messages[0].speech.replace('Candy & Confectionery Products Manufacturing', responseBody.description);
							}
							res.json(body).end();
						}
					});					
				} else {
					res.json(body).end();
				}
			} 
			else{
				res.json(body).end();
			}
		}
	});
});

module.exports = router;