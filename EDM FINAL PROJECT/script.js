// script.js

// Global variable to store company data
let allCompanies = [];
let filteredCompanies = [];
let currentPage = 1;
const rowsPerPage = 10; // Number of companies per page

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic (centralized) ---
    const themeToggle = document.getElementById('checkbox');
    const body = document.body;

    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            themeToggle.checked = true;
        }
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // --- Sidebar Active Link Logic ---
    const navLinks = document.querySelectorAll('.side-nav-link');
    const currentPath = window.location.pathname.split('/').pop(); // Get current HTML file name
    const currentHash = window.location.hash.substring(1); // Get current hash (e.g., "overview-main")

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref) { // This is an <a> tag
            const linkPath = linkHref.split('/').pop().split('#')[0]; // Get file name
            const linkHash = linkHref.split('#')[1]; // Get hash

            // If on dashboard.html and the link points to it
            if (currentPath === 'dashboard.html' && linkPath === 'dashboard.html') {
                if (linkHash === currentHash) {
                    link.classList.add('active');
                } else if (!currentHash && linkHash === 'overview-main') {
                    // Default to overview-main if no hash is present in URL
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            } else {
                // For other potential static HTML pages (if you re-introduce them)
                link.classList.remove('active');
            }
        } else if (link.tagName === 'BUTTON') { // This is a <button> tag for internal tabs
            link.classList.remove('active'); // showMainTab will handle active state for buttons
        }
    });

    // --- Initial Dashboard Tab Display on Load ---
    if (currentPath === 'dashboard.html') {
        const hash = window.location.hash.substring(1); // Get hash from URL (e.g., #dataset-main)
        if (hash && document.getElementById(hash)) {
            showMainTab(hash);
        } else {
            // Default to overview if no hash or invalid hash
            // This will also activate the 'Overview' button
            showMainTab('overview-main');
        }
    }

    // --- Load Company Data and Render List ---
    loadCompanyData();
});


// --- Your existing showMainTab function ---
function showMainTab(tabId) {
    // Hide all main tab contents
    const mainTabs = document.querySelectorAll('.main-tab-content');
    mainTabs.forEach(tab => tab.classList.remove('active'));

    // Show the selected main tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update active class in sidebar navigation for *all* links
    const navLinks = document.querySelectorAll('.side-nav .side-nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active'); // Remove active from all

        // If it's a button and its onclick matches
        if (link.tagName === 'BUTTON' && link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${tabId}'`)) {
            link.classList.add('active');
        }
        // If it's an anchor tag and its href hash matches
        else if (link.tagName === 'A' && link.getAttribute('href') && link.getAttribute('href').includes(`#${tabId}`)) {
            link.classList.add('active');
        }
    });

    // Update URL hash for dashboard internal tabs
    if (window.location.pathname.endsWith('dashboard.html')) {
        history.replaceState(null, '', `#${tabId}`);
    }

    // If showing company list, re-render it
    if (tabId === 'companylist') {
        renderCompanyList();
    }
}


// --- Company List Functions ---
async function loadCompanyData() {
    try {
        const response = await fetch('top_1000_firms.xlsx - Data.csv');
        const csvText = await response.text();
        allCompanies = parseCSV(csvText); // Parse the CSV data
        filteredCompanies = [...allCompanies]; // Initialize filteredCompanies
        renderCompanyList(); // Render the initial list
    } catch (error) {
        console.error('Error loading company data:', error);
        document.getElementById('companyTable').querySelector('tbody').innerHTML = '<tr><td colspan="4">Error loading company data.</td></tr>';
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const companies = [];

    // Assuming headers: "company_name", "sector", "firm_type", "sales_2021"
    const companyNameCol = headers.indexOf('Company Name'); // Adjust if your column name is different
    const sectorCol = headers.indexOf('Sector');
    const firmTypeCol = headers.indexOf('Firm Type');
    const sales2021Col = headers.indexOf('Gross Sales (2021)'); // Adjust to your actual 2021 sales column

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line); // Handle commas within quoted fields
        
        if (values.length > Math.max(companyNameCol, sectorCol, firmTypeCol, sales2021Col)) {
            const companyName = values[companyNameCol] || 'N/A';
            const sector = values[sectorCol] || 'N/A';
            const firmType = values[firmTypeCol] || 'N/A';
            let sales2021 = parseFloat(values[sales2021Col]) || 0;
            sales2021 = (sales2021 / 1000000000).toFixed(2); // Convert to Billions and format

            companies.push({ companyName, sector, firmType, sales2021: parseFloat(sales2021) });
        }
    }
    // Sort by sales in descending order by default
    return companies.sort((a, b) => b.sales2021 - a.sales2021);
}

// Helper to parse a CSV line, handling commas within quotes
function parseCSVLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim()); // Push the last field
    return result;
}


function renderCompanyList() {
    const tableBody = document.getElementById('companyTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const companiesToDisplay = filteredCompanies.slice(startIndex, endIndex);

    companiesToDisplay.forEach(company => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = company.companyName;
        row.insertCell().textContent = company.sector;
        row.insertCell().textContent = company.firmType;
        row.insertCell().textContent = `${company.sales2021.toLocaleString()}B`; // Format as ₱X.XXB
    });

    updatePaginationControls();
}

function filterCompanyList() {
    const searchTerm = document.getElementById('companySearch').value.toLowerCase();
    const sectorFilter = document.getElementById('sectorFilter').value;
    const firmTypeFilter = document.getElementById('firmTypeFilter').value;

    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = company.companyName.toLowerCase().includes(searchTerm);
        const matchesSector = sectorFilter === '' || company.sector === sectorFilter;
        const matchesFirmType = firmTypeFilter === '' || company.firmType === firmTypeFilter;
        return matchesSearch && matchesSector && matchesFirmType;
    });

    currentPage = 1; // Reset to first page after filtering
    renderCompanyList();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.querySelector('#pagination-controls button:first-child').disabled = currentPage === 1;
    document.querySelector('#pagination-controls button:last-child').disabled = currentPage === totalPages || totalPages === 0;
}

function nextPage() {
    const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderCompanyList();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCompanyList();
    }
}


// --- Dummy rendering functions for dashboard charts (replace with your actual data and logic) ---
// These are placeholders for your existing chart functions.
// Ensure your actual data loading and plotting functions are present.

function renderNationalSalesTrend() {
    const data = [{
        x: [2018, 2019, 2020, 2021],
        y: [7000, 7200, 7100, 7500], // Dummy sales in billions
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Total Sales',
        line: { color: 'var(--harvard-crimson)', width: 3 },
        marker: { size: 8 }
    }];

    const layout = {
        title: {
            text: 'National Sales Trend (2018-2021)',
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-navy') }
        },
        xaxis: {
            title: 'Year',
            tickvals: [2018, 2019, 2020, 2021],
            tickmode: 'array',
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Sales (Billions ₱)',
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 50, b: 50, l: 60, r: 20 },
        font: { family: 'Segoe UI, sans-serif' },
        hovermode: 'closest'
    };

    Plotly.newPlot('sales-trend-chart', data, layout, { responsive: true });
}

function renderSectoralDistributionChart() {
    const data = [{
        values: [45, 30, 15, 10], // Dummy percentages
        labels: ['Manufacturing', 'Services', 'Agriculture', 'Others'],
        type: 'pie',
        hole: .4,
        marker: {
            colors: ['#71C0BB', '#332D56', '#4E6688', '#756AB6'] // Matching your theme colors
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+percent+name'
    }];

    const layout = {
        title: {
            text: 'Sales Distribution by Sector (2021)',
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-navy') }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 50, b: 50, l: 20, r: 20 },
        showlegend: true,
        legend: {
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') }
        },
        font: { family: 'Segoe UI, sans-serif' }
    };

    Plotly.newPlot('sectoral-distribution-chart', data, layout, { responsive: true });
}

function renderFirmPerformanceChart() {
    const firms = ['Firm A', 'Firm B', 'Firm C', 'Firm D', 'Firm E'];
    const sales = [150, 120, 90, 80, 70]; // Dummy sales
    const profits = [30, 25, 18, 15, 12]; // Dummy profits

    const trace1 = {
        x: firms,
        y: sales,
        name: 'Sales (Billions ₱)',
        type: 'bar',
        marker: { color: 'var(--harvard-crimson)' }
    };

    const trace2 = {
        x: firms,
        y: profits,
        name: 'Profits (Billions ₱)',
        type: 'bar',
        marker: { color: 'var(--primary-navy)' }
    };

    const data = [trace1, trace2];

    const layout = {
        barmode: 'group',
        title: {
            text: 'Top 5 Firm Performance (2021)',
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-navy') }
        },
        xaxis: {
            title: 'Firm',
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Amount (Billions ₱)',
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 50, b: 50, l: 60, r: 20 },
        font: { family: 'Segoe UI, sans-serif' },
        legend: {
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') }
        }
    };

    Plotly.newPlot('firm-performance-chart', data, layout, { responsive: true });
}

// Example: Function to generate a forecast (dummy for now)
function generateForecast() {
    console.log('Generating forecast...');
    const forecastType = document.getElementById('forecast-type').value;
    const forecastYears = document.getElementById('forecast-years').value;
    const forecastTarget = document.getElementById('forecast-target').value;

    console.log(`Forecast Type: ${forecastType}, Years: ${forecastYears}, Target: ${forecastTarget}`);

    // Dummy data for forecast chart
    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]; // Extended years
    const sales = [7000, 7200, 7100, 7500, 7800, 8100, 8400, 8700, 9000]; // Dummy sales data

    const trace = {
        x: years,
        y: sales,
        mode: 'lines+markers',
        name: 'Projected Sales',
        line: { color: 'var(--harvard-crimson)' }
    };

    const layout = {
        title: {
            text: 'Projected National Sales Over Time',
            font: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-navy') }
        },
        xaxis: {
            title: 'Year',
            tickvals: years, // Ensure all years are shown as ticks
            tickmode: 'array',
            automargin: true,
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Sales (in Billions ₱)',
            automargin: true,
            tickfont: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dark') },
            gridcolor: 'rgba(0,0,0,0.1)'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        margin: { t: 50, b: 50, l: 60, r: 20 },
        hovermode: 'closest',
        font: {
            family: 'Segoe UI, sans-serif'
        }
    };

    const config = { responsive: true };
    Plotly.newPlot('forecast-chart', [trace], layout, config);
}