const express = require('express');
const router = express.Router();
const Vonage = require('@vonage/server-sdk');



router.get('/nexmo', (req, res) => {

    const vonage = new Vonage({
    apiKey: "504cca17",
    apiSecret: "s0Yc5N7THgWpESs2"
    })

    const from = "Vonage APIs"
    const to = "254717616430"
    const text = 'A text message sent using the Vonage SMS API'

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })
})