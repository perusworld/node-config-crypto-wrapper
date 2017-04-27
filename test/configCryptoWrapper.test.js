let cryptoWrapperApi = require('../node-config-crypto-wrapper').wrapper();
let cryptoWrapper = new cryptoWrapperApi.DefaultConfigCryptoWrapper({}, {});
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