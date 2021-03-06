var fs = require('fs')
var https = require('https')
var pretty = require('prettyjson')
var args = require('minimist')(process.argv.slice(2), {
  default: {
    retry:              process.env['ZM_RETRY']         || 0,
    interval:           process.env['ZM_INTERVAL']      || 5000,
    keepalive:          process.env['ZM_KEEPALIVE']     || false,
    'zerotier-home':    process.env['ZM_ZEROTIER_HOME'] || '/var/lib/zerotier-one',
    network:            process.env['ZM_NETWORK'],
    'zerotier-api-key': process.env['ZM_ZEROTIER_API_KEY']
  }
})

if (!args.data)
  { console.error('Missing required `data` parameter'); process.exit(1) }
if (!args.network)
  { console.error('Missing required `network` parameter'); process.exit(1) }
if (!args['zerotier-api-key'])
  { console.error('Missing required `zerotier-api-key` parameter'), process.exit(1) }

delete args._
console.log('CLI arguments')
console.log('===')
console.log(pretty.render(args))

// Identity functions 
function readIdentity(callback) {
  try {
    fs.readFile(args['zerotier-home']+'/identity.public', function(err, data) {
      if (err) return callback(err)
      callback(null, data.toString().split(':')[0]) 
    })
  } catch(e) { callback(e) }
}

// API functions
var apiResponse;
var apiError;
function callApi(identity, network, key, data, callback) {
  var options = {
    hostname: 'my.zerotier.com',
    port: 443,
    path: '/api/network/'+network+'/member/'+identity,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer '+key
    }
  }

  console.log('API call #'+retryCounter)
  console.log('===')
  console.log(pretty.render(options))

  var body = ''
  var req = https.request(options, function(res) {
    res.setEncoding('utf8')
    res.on('data', function(chunk) {
      body += chunk
    })
    res.on('end', function() {
      callback(null, res, body)
    })
  })

  req.on('error', callback)
  req.write(data)
  req.end()
}

var retryCounter = 0
function err(err) {
  console.error(err)
  if (args.retry === 0 || retryCounter < args.retry) loop()
}

function done() {
  if (!args.keepalive) process.exit(0)
  setInterval(function() {
    console.log('Keepalive...')
  }, args.interval)
}

function loop() {
  retryCounter += 1
  setTimeout(function() {
    readIdentity(function(e, identity) {
      if (e) return err(e) 
      callApi(identity, args.network, args['zerotier-api-key'], args.data, function(e, res, body) {
        if (e) return err(e)
        if (res.statusCode === 200) return done()
        err(body)
      })
    })
  }, args.interval)
}
loop()
