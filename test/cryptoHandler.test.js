let cryptoWrapperApi = require('../node-config-crypto-wrapper').wrapper();
let cryptoHandler = new cryptoWrapperApi.DefaultCryptoHandler({});
let plainText = 'This is a sample text';

test('Test encyption/decryption using DefaultCryptoHandler', done => {
  cryptoHandler.encrypt(plainText, (err, cipherText) => {
    cryptoHandler.decrypt(cipherText, (err, decryptedText) => {
      expect(decryptedText).toBe(plainText);
      done();
    });
  });
});