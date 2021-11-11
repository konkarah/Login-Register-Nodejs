function celcom(text,element){
    const https = require('https');

    var data = JSON.stringify({
        "apikey": "194ad2d98dc801833c058389e21d547c",
        "partnerID": "77",
        "mobile": element,
        "message": text,
        "shortcode": "CELCOM_SMS",
        "username": "demoaccount",
        "password":"demo25"
    })
    var settings = {
        hostname: 'mysms.celcomafrica.com',
        path: 443,
        path: '/api/services/sendsms',
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'connection': 'keep-alive'
        },
    };
    
    const req = https.request(settings, res => {
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', d => {
        process.stdout.write(d)
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
  req.write(data)
  req.end()
}

module.exports = celcom;