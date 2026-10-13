import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Build the JSON-LD object dynamically in JS
const schemaData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": pageTitle,
  "description": metaDescription,
  "url": `https://yourdomain.com/${fileName.replace('./', '')}`,
  "keywords": ["insider trading", "SEC Form 4", "insider buying", "stock market", "C-suite trades"],
  "variableMeasured": "Total Invested Value, Shares Bought, Weighted Average Price"
});

// Pass it into the Jekyll Front Matter
const pageContent = `---
layout: default
title: "${pageTitle}"
description: "${metaDescription}"
schema_json: '${schemaData}'
---

<!-- Rest of your page content, style blocks, and HTML tables -->
`;

async function generateJekyllPage({ viewName, fileName, pageTitle, metaDescription, activeNav }) {
  const { data, error } = await supabase.from(viewName).select('*');
  if (error) {
    console.error(`Error fetching ${viewName}:`, error);
    return;
  }

  const rows = (data || []).map((row, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong><a href="https://finance.yahoo.com/quote/${row.ticker_symbol}" target="_blank" rel="noopener">${row.ticker_symbol}</a></strong></td>
      <td>${row.company_name || 'N/A'}</td>
      <td data-order="${row.total_value_invested}">$${Number(row.total_value_invested).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
      <td data-order="${row.total_shares_bought}">${Number(row.total_shares_bought).toLocaleString('en-US')}</td>
      <td>$${Number(row.weighted_avg_price).toFixed(2)}</td>
      <td>${row.num_unique_insiders}</td>
      <td>${row.c_suite_transaction_count > 0 ? `<span class="badge-ceo">Yes (${row.c_suite_transaction_count})</span>` : 'No'}</td>
    </tr>
  `).join('');

  // Jekyll Front Matter at the top + your existing layout name
  const pageContent = `---
layout: default
title: "${pageTitle}"
description: "${metaDescription}"
---

<!-- DataTables CSS for sorting/filtering -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">

<style>
  .badge-ceo { background: #e6f4ea; color: #137333; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
  .insider-nav { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
  .insider-nav a { text-decoration: none; padding: 8px 14px; background: #f0f0f0; border-radius: 6px; color: #333; font-weight: 500; }
  .insider-nav a.active { background: #0052cc; color: #fff; }
</style>

<div class="insider-nav">
  <a href="./top-bought-today.html" class="${activeNav === 'today' ? 'active' : ''}">Today</a>
  <a href="./top-bought-this-week.html" class="${activeNav === 'week' ? 'active' : ''}">This Week</a>
  <a href="./top-bought-this-month.html" class="${activeNav === 'month' ? 'active' : ''}">This Month</a>
  <a href="./top-bought-this-year.html" class="${activeNav === 'year' ? 'active' : ''}">This Year</a>
</div>

<h1>${pageTitle}</h1>
<p>Aggregated open-market insider purchases from SEC Form 4 filings.</p>

<table id="insiderTable" class="display" style="width:100%">
  <thead>
    <tr>
      <th>Rank</th>
      <th>Ticker</th>
      <th>Company</th>
      <th>Total Invested ($)</th>
      <th>Shares Bought</th>
      <th>Avg Price</th>
      <th>Unique Insiders</th>
      <th>C-Suite Activity</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script>
  $(document).ready(function() {
    $('#insiderTable').DataTable({
      pageLength: 25,
      order: [[3, 'desc']], // Sort by Total Invested descending by default
      responsive: true
    });
  });
</script>
`;

  fs.writeFileSync(fileName, pageContent);
  console.log(`Successfully generated ${fileName} for Jekyll`);
}

// Generate the pages
async function buildAll() {
  await generateJekyllPage({
    viewName: 'top_buys_weekly',
    fileName: './top-bought-this-week.html',
    pageTitle: 'Top 100 Most Bought Stocks by Insiders (Past 7 Days)',
    metaDescription: 'Top 100 stocks with highest insider buying activity over the past week based on SEC Form 4 filings.',
    activeNav: 'week'
  });

  // You can call additional views (Daily, Monthly, Yearly) here
}

buildAll();
