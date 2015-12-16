require('array.prototype.find')
require('es6-promise').polyfill()
require('isomorphic-fetch')
const Transaction = require('ethereumjs-tx')
const async = require('async')
const request = require('request')
const inherits = require('util').inherits
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const createPayload = require('../util/create-payload.js')

module.exports = RpcSource


function RpcSource(opts){
  const self = this
  self.rpcUrl = opts.rpcUrl
  self.methods = [
    'eth_hashrate',
    'eth_gasPrice',
    'eth_blockNumber',
    'eth_getBalance',
    'eth_getStorageAt',
    'eth_getTransactionCount',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getUncleCountByBlockHash',
    'eth_getUncleCountByBlockNumber',
    'eth_getCode',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getTransactionByHash',
    'eth_getTransactionByBlockHashAndIndex',
    'eth_getTransactionByBlockNumberAndIndex',
    'eth_getTransactionReceipt',
    'eth_getUncleByBlockHashAndIndex',
    'eth_getUncleByBlockNumberAndIndex',
    // 'eth_newFilter',
    // 'eth_newBlockFilter',
    // 'eth_newPendingTransactionFilter',
    // 'eth_uninstallFilter',
    // 'eth_getFilterChanges',
    // 'eth_getFilterLogs',
    // 'eth_getLogs',
    'eth_sendRawTransaction',
  ]
}

RpcSource.prototype.sendAsync = function(payload, cb){
  const self = this
  var targetUrl = self.rpcUrl
  var method = payload.method
  var params = payload.params

  // new payload with random large id,
  // so as not to conflict with other concurrent users

  var payload = createPayload({ method: method, params: params })
  // console.log('uri:', targetUrl)
  // console.log('method:', method)
  // console.log('params:', params)

  request({
    uri: targetUrl,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    rejectUnauthorized: false,
  }, function(err, res, body) {
    if (err) return cb(err)

    var resultObj = {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
    }

    // parse response into raw account
    var data
    try {
      data = JSON.parse(body)
    } catch (err) {
      console.error(err.stack)
      return cb(err)
    }

    // console.log('------------------ network -----------------')
    // console.log(payload, '->', data)
    // console.log('---------------------------------------------')

    if (data.error) return cb(new Error(data.error.message))  
    
    resultObj.result = data.result
    cb(null, resultObj)
  })
  
}
