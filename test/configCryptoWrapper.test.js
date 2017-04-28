let cryptoWrapperApi = require('../node-config-crypto-wrapper').wrapper();
let cryptoWrapper = new cryptoWrapperApi.DefaultConfigCryptoWrapper({}, {});
let customCryptoWrapper = new cryptoWrapperApi.ConfigCryptoWrapper({
  cryptoHandler : {
    //passthrough
    encrypt: (str, callback) => {
      callback(null, str);
    },
    //passthrough
    decrypt: (cip, callback) => {
      callback(null, cip);
    }
  }
});
let plainText = 'This is a sample text';

test('Test encyption/decryption using DefaultConfigCryptoWrapper directly', done => {
  let enc = {};
  cryptoWrapper.encrypt(enc, 'entry', plainText, () => {
    let dec = {};
    cryptoWrapper.decrypt(dec, 'entry', enc.entry, () => {
      expect(dec.entry).toBe(plainText);
      done();
    });
  });
});

test('Test encyption/decryption using DefaultConfigCryptoWrapper through config', done => {
  cryptoWrapper.loadConfig('cryptoConfig', (err, cryptoConfig) => {
    expect(err).toBeNull();
    expect(cryptoConfig).not.toBeNull();
    expect(cryptoConfig.entry).not.toBeNull();
    expect(cryptoConfig.entry).toBe(plainText);
    done();
  });
});

test('Test encyption/decryption using custom crypto handler through config', done => {
  customCryptoWrapper.loadConfig('customCryptoConfig', (err, cryptoConfig) => {
    expect(err).toBeNull();
    expect(cryptoConfig).not.toBeNull();
    expect(cryptoConfig.entry).not.toBeNull();
    expect(cryptoConfig.entry).toBe(plainText);
    done();
  });
});