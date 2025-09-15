#!/usr/bin/env node

/**
 * Script to generate a static sitemap.xml file
 * Run with: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Import manifesto data (you might need to adjust this based on your setup)
const manifestoDataPath = path.join(__dirname, '../lib/manifesto-data.ts');
const manifestoContent = fs.readFileSync(manifestoDataPath, 'utf-8');

// Extract the number of manifesto items (27)
const TOTAL_REFORMS = 27;

// Configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalreforms.com';
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// Priority mapping
const PRIORITY_MAP = {
  home: 1.0,
  agenda: 0.9,
  opinions: 0.8,
  category: 0.7,
  auth: 0.3,
  legal: 0.4,
};

// Change frequency mapping
const CHANGE_FREQ_MAP = {
  home: 'daily',
  agenda: 'weekly',
  opinions: 'daily',
  category: 'weekly',
  auth: 'monthly',
  legal: 'yearly',
};

// Generate URL entries
function generateUrlEntry(loc, priority = 0.5, changefreq = 'weekly', lastmod = CURRENT_DATE) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Generate the complete sitemap
function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  // Homepage
  sitemap += generateUrlEntry(
    SITE_URL,
    PRIORITY_MAP.home,
    CHANGE_FREQ_MAP.home
  );

  // All reform agenda pages
  for (let i = 1; i <= TOTAL_REFORMS; i++) {
    sitemap += generateUrlEntry(
      `${SITE_URL}/agenda/${i}`,
      PRIORITY_MAP.agenda,
      CHANGE_FREQ_MAP.agenda
    );
  }

  // Opinions page
  sitemap += generateUrlEntry(
    `${SITE_URL}/opinions`,
    PRIORITY_MAP.opinions,
    CHANGE_FREQ_MAP.opinions
  );

  // Auth pages
  const authPages = ['login', 'signup'];
  authPages.forEach(page => {
    sitemap += generateUrlEntry(
      `${SITE_URL}/auth/${page}`,
      PRIORITY_MAP.auth,
      CHANGE_FREQ_MAP.auth
    );
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

// Generate sitemap index (for large sites)
function generateSitemapIndex() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-main.xml</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-agendas.xml</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
  </sitemap>
</sitemapindex>`;
  
  return sitemapIndex;
}

// Generate separate sitemap for agendas
function generateAgendasSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (let i = 1; i <= TOTAL_REFORMS; i++) {
    sitemap += generateUrlEntry(
      `${SITE_URL}/agenda/${i}`,
      PRIORITY_MAP.agenda,
      CHANGE_FREQ_MAP.agenda
    );
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

// Main execution
function main() {
  const publicDir = path.join(__dirname, '../public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate main sitemap
  const sitemap = generateSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Generated sitemap.xml');

  // Generate sitemap for agendas only
  const agendasSitemap = generateAgendasSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-agendas.xml'), agendasSitemap);
  console.log('✅ Generated sitemap-agendas.xml');

  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);
  console.log('✅ Generated sitemap-index.xml');

  console.log('\n📍 Sitemaps generated successfully!');
  console.log(`📎 Submit to Google Search Console: ${SITE_URL}/sitemap.xml`);
}

// Run the script
main();
