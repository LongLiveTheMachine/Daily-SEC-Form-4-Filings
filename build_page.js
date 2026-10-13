import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function renderSeoPage() {
  const { data, error } = await supabase.from('top_buys_weekly').select('*');
  if (error) throw error;

  const rows = data.map((row, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong><a href="https://finance.yahoo.com/quote/${row.ticker_symbol}" target="_blank">${row.ticker_symbol}</a></strong></td>
      <td>${row.company_name || 'N/A'}</td>
      <td data-order="${row.total_value_invested}">$${Number(row.total_value_invested).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
      <td data-order="${row.total_shares_bought}">${Number(row.total_shares_bought).toLocaleString('en-US')}</td>
      <td>$${Number(row.weighted_avg_price).toFixed(2)}</td>
      <td>${row.num_unique_insiders}</td>
      <td>${row.c_suite_transaction_count > 0 ? `<span class="badge-ceo">Yes (${row.c_suite_transaction_count})</span>` : 'No'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Top 100 Stocks Most Bought by Insiders This Week | SEC Form 4 Tracker</title>
  <meta name="description" content="Discover the top 100 stocks with highest insider buying activity over the past 7 days based on SEC Form 4 filings. Filter by C-suite trades and total value.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- DataTables CSS for client-side sorting/filtering -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; background: #fafafa; }
    h1 { color: #111; margin-bottom: 5px; }
    .subhead { color: #555; margin-bottom: 25px; }
    table.dataTable { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .badge-ceo { background: #e6f4ea; color: #137333; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
    .nav-links { margin-bottom: 20px; display: flex; gap: 12px; }
    .nav-links a { text-decoration: none; padding: 8px 14px; background: #eee; border-radius: 6px; color: #333; font-weight: 500; }
    .nav-links a.active { background: #0052cc; color: #fff; }
  </style>
</head>
<body>

  <div class="nav-links">
    <a href="./top-bought-today.html">Today</a>
    <a href="./top-bought-this-week.html" class="active">This Week</a>
    <a href="./top-bought-this-month.html">This Month</a>
    <a href="./top-bought-this-year.html">This Year</a>
  </div>

  <h1>Top 100 Most Bought Stocks by Insiders (Past 7 Days)</h1>
  <p class="subhead">Aggregated from SEC Form 4 open-market purchase filings.</p>

  <table id="insiderTable" class="display grid" style="width:100%">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Ticker</th>
        <th>Company Name</th>
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
        order: [[3, 'desc']], // Default sort by Total Invested
        responsive: true
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync('./top-bought-this-week.html', html);
  console.log('Page generated successfully!');
}

renderSeoPage();
