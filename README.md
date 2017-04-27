# Simple Crypto Wrapper For Config #

Simple Crypto Wrapper For [Config](https://github.com/lorenwest/node-config)

## Install ##
```bash
npm install github:perusworld/node-config-crypto-wrapper --save
```
## Usage ##

### Using password based crypto ###
Assuming the following is config with and encrypted property
```json
{
  "cryptoConfig": {
    "entry": "encrypted:1830da46bc726b7866fce42c2ab91bc33f4267a52a42a170830eedd6b9f43351"
  }
}
```

```javascript
let cryptoWrapperApi = require('node-config-crypto-wrapper').wrapper();
let cryptoWrapper = new cryptoWrapperApi.DefaultConfigCryptoWrapper({}, {});
  cryptoWrapper.loadConfig('cryptoConfig', (err, cryptoConfig) => {
    //cryptoConfig now has the field decrypted
  });
```
With the options
```javascript
let cryptoWrapperApi = require('node-config-crypto-wrapper').wrapper();
let cryptoWrapper = new cryptoWrapperApi.DefaultConfigCryptoWrapper({
  algorithm: 'aes256',
  password: 'changeit',
  format: 'hex',
  decryptedFormat: 'utf8'
}, {});
cryptoWrapper.loadConfig('cryptoConfig', (err, cryptoConfig) => {
  //cryptoConfig now has the field decrypted
});
```
