const fs = require('fs');
const path = require('path');
const https = require('https');

const logos = {
  'logo-permata.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-permata.webp',
  'logo-bri.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-BRI.webp',
  'logo-mandiri.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-mandiri.webp',
  'logo-bni.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-BNI-1.webp',
  'logo-danamon.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-danamon.webp',
  'logo-maybank.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-maybank.webp',
  'logo-linkaja.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-linkaja.webp',
  'logo-dana.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-dana.webp',
  'logo-spay.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-s-pay.webp',
  'logo-qris.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-qris.webp',
  'logo-octoclick.webp': 'https://www.bayarind.id/wp-content/themes/bayarind/assets/img/logo-octo-click.webp'
};

const outputDir = path.join(__dirname, '..', 'public', 'images', 'payments');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Downloading logos to: ${outputDir}`);

Object.entries(logos).forEach(([filename, url]) => {
  const dest = path.join(outputDir, filename);
  const file = fs.createWriteStream(dest);

  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${filename}: Status code ${response.statusCode}`);
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Successfully downloaded: ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
});
