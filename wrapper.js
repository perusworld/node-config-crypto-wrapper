"use strict";

const
  async = require('async'),
  config = require('config'),
  merge = require("merge"),
  crypto = require('crypto'),
  util = require('util');

function ConfigCryptoWrapper(opts) {
  this.conf = merge({
    decryptKeyName: 'encrypted:',
    encryptKeyName: 'toencrypt:'
  }, opts);
  if (!this.conf.cryptoHandler) {
    throw new Error("Missing cryptoHandler");
  }
}

ConfigCryptoWrapper.prototype.iterateKeys = function (qu, obj, clonedObj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var element = obj[prop];
      if ('object' === typeof element) {
        clonedObj[prop] = {};
        this.iterateKeys(qu, element, clonedObj[prop]);
      } else {
        qu.push({ obj: clonedObj, key: prop, value: element }, function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  }
};

ConfigCryptoWrapper.prototype.parseConfigs = function (key, queueCallback, outerCallback) {
  this.parseObj(config.get(key), queueCallback, outerCallback);
};

ConfigCryptoWrapper.prototype.parseObj = function (obj, queueCallback, outerCallback) {
  var ret = {};
  var ptr = this;
  var qu = async.queue(queueCallback, 2);
  qu.drain = function () {
    outerCallback(null, ret);
  };
  async.nextTick(() => {
    ptr.iterateKeys(qu, obj, ret);
  });
};

ConfigCryptoWrapper.prototype.loadConfig = function (key, outerCallback) {
  var ptr = this;
  this.parseConfigs(key, (task, callback) => {
    ptr.decrypt(task.obj, task.key, task.value, callback);
  }, outerCallback);
};

ConfigCryptoWrapper.prototype.encryptConfig = function (key, outerCallback) {
  var ptr = this;
  this.parseConfigs(key, (task, callback) => {
    ptr.encrypt(task.obj, task.key, task.value, callback);
  }, outerCallback);
};

ConfigCryptoWrapper.prototype.decrypt = function (obj, key, value, callback) {
  if ('string' === typeof value && value.startsWith(this.conf.decryptKeyName)) {
    value = value.substring(this.conf.decryptKeyName.length);
    this.conf.cryptoHandler.decrypt(value, (err, decryptedText) => {
      if (err) {
        console.error('Failed to decrypt', err);
        //TODO: Bubble up as error
        obj[key] = null;
        callback();
      } else {
        obj[key] = decryptedText;
        callback();
      }
    });
  } else {
    obj[key] = value;
    async.nextTick(() => {
      callback();
    });
  }
};

ConfigCryptoWrapper.prototype.encrypt = function (obj, key, value, callback) {
  if ('string' === typeof value && value.startsWith(this.conf.encryptKeyName)) {
    value = value.replace(this.conf.encryptKeyName, '');
    this.conf.cryptoHandler.encrypt(value, (err, cipherText) => {
      if (err) {
        console.log('Failed to encrypt', value, err);
      } else {
        obj[key] = this.conf.decryptKeyName + cipherText;
        callback();
      }
    });
  } else {
    obj[key] = value;
    async.nextTick(() => {
      callback();
    });
  }
};


function DefaultCryptoHandler(opts) {
  this.conf = merge({
    algorithm: 'aes256',
    password: 'changeit',
    format: 'hex',
    decryptedFormat: 'utf8'
  }, opts);
}

DefaultCryptoHandler.prototype.encrypt = function (clearText, callback) {
  const cipher = crypto.createCipher(this.conf.algorithm, this.conf.password);
  var ptr = this;
  var encrypted = '';
  cipher.on('readable', () => {
    const data = cipher.read();
    if (data)
      encrypted += data.toString(this.conf.format);
  });
  cipher.on('end', () => {
    callback(null, encrypted);
  });
  cipher.on('error', (err) => {
    callback(err, null);
  });
  cipher.write(clearText);
  cipher.end();
};

DefaultCryptoHandler.prototype.decrypt = function (cipherText, callback) {
  const decipher = crypto.createDecipher(this.conf.algorithm, this.conf.password);
  var ptr = this;
  var decrypted = '';
  decipher.on('readable', () => {
    const data = decipher.read();
    if (data)
      decrypted += data.toString(this.conf.decryptedFormat);
  });
  decipher.on('end', () => {
    callback(null, decrypted);
  });
  decipher.on('error', (err) => {
    callback(err, null);
  });
  decipher.write(cipherText, this.conf.format);
  decipher.end();
};

function DefaultConfigCryptoWrapper(cryptoOpts, configOpts) {
  DefaultConfigCryptoWrapper.super_.call(this, merge({
    cryptoHandler: new DefaultCryptoHandler(cryptoOpts),
  }, configOpts));
}

util.inherits(DefaultConfigCryptoWrapper, ConfigCryptoWrapper);

module.exports.ConfigCryptoWrapper = ConfigCryptoWrapper;
module.exports.DefaultCryptoHandler = DefaultCryptoHandler;
module.exports.DefaultConfigCryptoWrapper = DefaultConfigCryptoWrapper;