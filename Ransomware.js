const encryptor = require("file-encryptor");
const fs = require("fs");
const notifier = require('node-notifier');
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const folder = "./sample/";
const key = "Lavs29"; // Encryption key

const encryptFiles = () => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(folder);
    let count = 0;

    files.forEach((file) => {
      encryptor.encryptFile(
        `${folder}${file}`,
        `${folder}${file}.encrypted`,
        key,
        function (err) {
          if (err) {
            console.error(`Error encrypting file ${file}: ${err.message}`);
            reject(err);
          } else {
            try {
              fs.unlinkSync(`${folder}${file}`);
              console.log(`File "${file}" encrypted`);
              count++;
              if (count === files.length) {
                resolve();
              }
              // Notify when encryption is successful
              notifier.notify({
                title: 'Encryption Complete',
                message: `File "${file}" has been encrypted successfully.`,
              });
            } catch (unlinkError) {
              console.error(
                `Error deleting encrypted file ${file}: ${unlinkError.message}`
              );
              reject(unlinkError);
            }
          }
        }
      );
    });
  });
};

encryptFiles()
  .then(() => {
    readline.question("Enter decryption key: ", (key) => {
      const files = fs.readdirSync(folder);
      files.forEach((file) => {
        // Decrypt file.
        encryptor.decryptFile(
          `${folder}${file}`,
          `${folder}${file.replace(".encrypted", "")}`,
          key,
          function (err) {
            if (err) {
              console.error(`Error decrypting file ${file}: ${err.message}`);
            } else {
              try {
                fs.unlinkSync(`${folder}${file}`);
                console.log(`File "${file}" decrypted`);
              } catch (unlinkError) {
                console.error(
                  `Error deleting encrypted file ${file}: ${unlinkError.message}`
                );
              }
            }
          }
        );
      });
      notifier.notify({
        title: 'Decryption Complete',
        message: 'Files have been decrypted successfully.',
      });
      readline.close();
    });
  })
  .catch((err) => {
    console.error("Error encrypting or decrypting files:", err);
  });
