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
let encryptedText = "encrypted:1830da46bc726b7866fce42c2ab91bc33f4267a52a42a170830eedd6b9f43351";

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

test('Test decryption using DefaultConfigCryptoWrapper through config', done => {
  cryptoWrapper.loadConfig('cryptoConfig', (err, cryptoConfig) => {
    expect(err).toBeNull();
    expect(cryptoConfig).not.toBeNull();
    expect(cryptoConfig.entry).not.toBeNull();
    expect(cryptoConfig.entry).toBe(plainText);
    done();
  });
});

test('Test encryption using DefaultConfigCryptoWrapper through config', done => {
  cryptoWrapper.encryptConfig('unencryptedCryptoConfig', (err, cryptoConfig) => {
    expect(err).toBeNull();
    expect(cryptoConfig).not.toBeNull();
    expect(cryptoConfig.entry).not.toBeNull();
    expect(cryptoConfig.entry).toBe(encryptedText);
    done();
  });
});

test('Test decryption using custom crypto handler through config', done => {
  customCryptoWrapper.loadConfig('customCryptoConfig', (err, cryptoConfig) => {
    expect(err).toBeNull();
    expect(cryptoConfig).not.toBeNull();
    expect(cryptoConfig.entry).not.toBeNull();
    expect(cryptoConfig.entry).toBe(plainText);
    done();
  });
});