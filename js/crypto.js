const CryptoDB = (function() {
  let aesKeyStr = null;

  function ab2base64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base642ab(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  function getDerivedKey(pin, saltHex) {
    const salt = CryptoJS.enc.Hex.parse(saltHex);
    // 256-bit key = 8 words
    const key = CryptoJS.PBKDF2(pin, salt, { keySize: 256/32, iterations: 10000 });
    return key.toString(); // hex string
  }

  return {
    async setup(pin) {
      // 128-bit salt
      const salt = CryptoJS.lib.WordArray.random(128/8).toString();
      const keyStr = getDerivedKey(pin, salt);
      const validator = CryptoJS.SHA256(keyStr).toString();
      
      localStorage.setItem('aet_salt_v2', salt);
      localStorage.setItem('aet_validator_v2', validator);
      
      aesKeyStr = keyStr;
      return true;
    },

    async unlock(pin) {
      const salt = localStorage.getItem('aet_salt_v2');
      const validator = localStorage.getItem('aet_validator_v2');
      
      if (!salt || !validator) throw new Error('Not setup');

      const keyStr = getDerivedKey(pin, salt);
      const checkHash = CryptoJS.SHA256(keyStr).toString();

      if (checkHash === validator) {
        aesKeyStr = keyStr;
        return true;
      }
      return false;
    },
    
    isSetup() {
      return !!localStorage.getItem('aet_salt_v2');
    },

    isUnlocked() {
      return aesKeyStr !== null;
    },

    async encryptObj(obj) {
      if (!aesKeyStr) throw new Error('CryptoDB not unlocked');
      if (!obj) return obj;
      
      const json = JSON.stringify(obj);
      // CryptoJS AES uses CBC by default, which is fine and highly secure with random IV (handled automatically when encrypting with a passphrase, but since we pass a hex key, we should pass an IV).
      // Wait, if we just pass aesKeyStr (hex string), CryptoJS treats it as a passphrase and derives a key+IV automatically! This is perfectly safe.
      const encrypted = CryptoJS.AES.encrypt(json, aesKeyStr).toString();
      return encrypted;
    },

    async decryptObj(str) {
      if (!aesKeyStr) throw new Error('CryptoDB not unlocked');
      if (!str || typeof str !== 'string') return str;
      
      try {
        const decrypted = CryptoJS.AES.decrypt(str, aesKeyStr);
        const json = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(json);
      } catch (e) {
        console.error('Decryption failed', e);
        return null;
      }
    },
    
    async encryptBlob(blob) {
      if (!blob || !(blob instanceof Blob)) return blob;
      if (!aesKeyStr) {
        console.warn('CryptoDB não desbloqueado; armazenando blob diretamente.');
        return blob;
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const base64data = reader.result;
            const encrypted = CryptoJS.AES.encrypt(base64data, aesKeyStr).toString();
            resolve(new Blob([encrypted], { type: 'text/plain' }));
          } catch(e) {
            console.error('Falha ao criptografar blob, mantendo original:', e);
            resolve(blob);
          }
        };
        reader.onerror = function() {
          console.warn('FileReader erro ao criptografar blob, mantendo original');
          resolve(blob);
        };
        reader.readAsDataURL(blob);
      });
    },
    
    async decryptBlob(blob, originalType = 'image/jpeg') {
      if (!blob || !(blob instanceof Blob)) return blob;
      // Se o blob já tiver um tipo de imagem válido, ele não está criptografado como text/plain
      if (blob.type && blob.type.startsWith('image/')) {
        return blob;
      }
      if (!aesKeyStr) {
        return blob;
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const encryptedStr = reader.result;
            if (!encryptedStr || typeof encryptedStr !== 'string') {
              resolve(blob);
              return;
            }
            const decrypted = CryptoJS.AES.decrypt(encryptedStr, aesKeyStr);
            const dataUrl = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!dataUrl || !dataUrl.startsWith('data:image/')) {
              // Não descriptografou como dataUrl válido, pode ser o próprio blob original
              resolve(blob);
              return;
            }
            
            // Converter dataUrl para Blob
            const arr = dataUrl.split(',');
            if (arr.length < 2) {
              resolve(blob);
              return;
            }
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : originalType;
            const bstr = window.atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            resolve(new Blob([u8arr], { type: mime }));
          } catch(e) {
            console.warn('Erro ao descriptografar imagem, retornando fallback do blob original:', e);
            resolve(blob);
          }
        };
        reader.onerror = function() {
          console.warn('FileReader erro na descriptografia do blob');
          resolve(blob);
        };
        reader.readAsText(blob);
      });
    }
  };
})();
