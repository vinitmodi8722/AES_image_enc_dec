// Helper to convert array buffer to base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert base64 to array buffer
function base64ToArrayBuffer(base64) {
  let binaryString = window.atob(base64);
  let len = binaryString.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Encrypt the image using AES with user-provided key
function encryptImage() {
  const fileInput = document.getElementById("uploadImage");
  const file = fileInput.files[0];
  const encryptionKey = document.getElementById("encryptionKeyInput").value;

  if (!encryptionKey) {
    alert("Please enter an encryption key.");
    return;
  }

  if (file) {
    const originalFileName = file.name;
    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      const base64Image = arrayBufferToBase64(arrayBuffer);

      // Display the encryption key for the user to remember
      document.getElementById("encryptionKeyDisplay").innerText =
        "Encryption Key: " + encryptionKey;

      // Encrypt the base64 image string using AES
      const encrypted = CryptoJS.AES.encrypt(
        base64Image,
        encryptionKey
      ).toString();

      const blob = new Blob([encrypted], {
        type: "application/octet-stream",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = originalFileName + ".enc";
      link.click();
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Please upload an image.");
  }
}

// Decrypt the image using AES
function decryptImage() {
  const fileInput = document.getElementById("uploadEncryptedImage");
  const file = fileInput.files[0];
  const key = document.getElementById("decryptionKey").value;

  if (!key) {
    alert("Please enter the encryption key.");
    return;
  }

  if (file) {
    const originalFileName = file.name.replace(".enc", "");
    const reader = new FileReader();
    reader.onload = function (e) {
      const encryptedText = e.target.result;

      try {
        // Decrypt the text using AES with the provided key
        const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
        const decryptedBase64 = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedBase64) {
          throw new Error("Decryption failed");
        }

        // Convert the decrypted base64 back to an image
        const decryptedBuffer = base64ToArrayBuffer(decryptedBase64);

        const blob = new Blob([decryptedBuffer], { type: "image/jpeg" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = originalFileName;
        link.click();
      } catch (error) {
        alert("Decryption failed. Incorrect key.");
      }
    };
    reader.readAsText(file); // Reading the encrypted file as text (AES encrypted string)
  } else {
    alert("Please upload an encrypted image.");
  }
}
