const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace branding
content = content.replace(/@rungu\.id/g, '@shinerva.id');
content = content.replace(/Rungu Engine/g, 'Shinerva Engine');

// Replace footer links
content = content.replace(/href="\/privacy\.html" target="_blank"/g, 'href="/privacy"');
content = content.replace(/href="\/terms\.html" target="_blank"/g, 'href="/terms"');

// Add Refund and Contact links after Terms of Service
const oldFooterLinks = `<a href="/terms" className="hover:text-text transition-colors">
                    Terms of Service
                  </a>`;
const newFooterLinks = `<a href="/terms" className="hover:text-text transition-colors">
                    Terms of Service
                  </a>
                  <a href="/refund" className="hover:text-text transition-colors">
                    Refund Policy
                  </a>
                  <a href="/contact" className="hover:text-text transition-colors">
                    Contact Us
                  </a>`;

content = content.replace(oldFooterLinks, newFooterLinks);

fs.writeFileSync('src/App.jsx', content);
console.log("App.jsx fixed!");
