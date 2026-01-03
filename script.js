/**
 * ============================================
 * Gold Price Calculator - Main JavaScript
 * ============================================
 * Manual Gold Price Calculator (TradingView based)
 * Uses: Frankfurter API for currency exchange
 *       Manual input for Ounce price -> Calculates Tola -> Converts Currency
 */

// ============================================
// Configuration & Constants
// ============================================

// Detect Page Context
const isSilverPage = window.location.pathname.includes('silver');
const METAL_TYPE = isSilverPage ? 'SILVER' : 'GOLD';

const CONFIG = {
    // API Endpoints
    CURRENCY_API: 'https://open.er-api.com/v6/latest/USD',

    // Conversion constants
    GRAMS_PER_TROY_OZ: 31.1035,
    GRAMS_PER_TOLA: 11.6638,
    GRAMS_PER_KG: 1000
};

// Country data with currency codes (comprehensive list)
const COUNTRIES = [
    { name: 'United States', code: 'US', currency: 'USD', symbol: '$' },
    { name: 'Pakistan', code: 'PK', currency: 'PKR', symbol: '₨' },
    { name: 'India', code: 'IN', currency: 'INR', symbol: '₹' },
    { name: 'United Arab Emirates', code: 'AE', currency: 'AED', symbol: 'د.إ' },
    { name: 'Saudi Arabia', code: 'SA', currency: 'SAR', symbol: '﷼' },
    { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£' },
    { name: 'European Union', code: 'EU', currency: 'EUR', symbol: '€' },
    { name: 'Canada', code: 'CA', currency: 'CAD', symbol: 'C$' },
    { name: 'Australia', code: 'AU', currency: 'AUD', symbol: 'A$' },
    { name: 'Japan', code: 'JP', currency: 'JPY', symbol: '¥' },
    { name: 'China', code: 'CN', currency: 'CNY', symbol: '¥' },
    { name: 'Switzerland', code: 'CH', currency: 'CHF', symbol: 'Fr' },
    { name: 'Turkey', code: 'TR', currency: 'TRY', symbol: '₺' },
    { name: 'Malaysia', code: 'MY', currency: 'MYR', symbol: 'RM' },
    { name: 'Singapore', code: 'SG', currency: 'SGD', symbol: 'S$' },
    { name: 'Hong Kong', code: 'HK', currency: 'HKD', symbol: 'HK$' },
    { name: 'South Korea', code: 'KR', currency: 'KRW', symbol: '₩' },
    { name: 'Indonesia', code: 'ID', currency: 'IDR', symbol: 'Rp' },
    { name: 'Thailand', code: 'TH', currency: 'THB', symbol: '฿' },
    { name: 'Philippines', code: 'PH', currency: 'PHP', symbol: '₱' },
    { name: 'Bangladesh', code: 'BD', currency: 'BDT', symbol: '৳' },
    { name: 'Egypt', code: 'EG', currency: 'EGP', symbol: 'E£' },
    { name: 'South Africa', code: 'ZA', currency: 'ZAR', symbol: 'R' },
    { name: 'Nigeria', code: 'NG', currency: 'NGN', symbol: '₦' },
    { name: 'Brazil', code: 'BR', currency: 'BRL', symbol: 'R$' },
    { name: 'Mexico', code: 'MX', currency: 'MXN', symbol: 'MX$' },
    { name: 'Russia', code: 'RU', currency: 'RUB', symbol: '₽' },
    { name: 'Poland', code: 'PL', currency: 'PLN', symbol: 'zł' },
    { name: 'Sweden', code: 'SE', currency: 'SEK', symbol: 'kr' },
    { name: 'Norway', code: 'NO', currency: 'NOK', symbol: 'kr' },
    { name: 'Denmark', code: 'DK', currency: 'DKK', symbol: 'kr' },
    { name: 'New Zealand', code: 'NZ', currency: 'NZD', symbol: 'NZ$' },
    { name: 'Czech Republic', code: 'CZ', currency: 'CZK', symbol: 'Kč' },
    { name: 'Hungary', code: 'HU', currency: 'HUF', symbol: 'Ft' },
    { name: 'Israel', code: 'IL', currency: 'ILS', symbol: '₪' },
    { name: 'Kuwait', code: 'KW', currency: 'KWD', symbol: 'د.ك' },
    { name: 'Qatar', code: 'QA', currency: 'QAR', symbol: 'ر.ق' },
    { name: 'Bahrain', code: 'BH', currency: 'BHD', symbol: '.د.ب' },
    { name: 'Oman', code: 'OM', currency: 'OMR', symbol: 'ر.ع.' },
    { name: 'Jordan', code: 'JO', currency: 'JOD', symbol: 'د.ا' },
    { name: 'Morocco', code: 'MA', currency: 'MAD', symbol: 'د.م.' },
    { name: 'Kenya', code: 'KE', currency: 'KES', symbol: 'KSh' },
    { name: 'Vietnam', code: 'VN', currency: 'VND', symbol: '₫' },
    { name: 'Sri Lanka', code: 'LK', currency: 'LKR', symbol: 'Rs' },
    { name: 'Nepal', code: 'NP', currency: 'NPR', symbol: 'रू' },
    { name: 'Romania', code: 'RO', currency: 'RON', symbol: 'lei' },
    { name: 'Bulgaria', code: 'BG', currency: 'BGN', symbol: 'лв' },
    { name: 'Croatia', code: 'HR', currency: 'EUR', symbol: '€' },
    { name: 'Iceland', code: 'IS', currency: 'ISK', symbol: 'kr' }
];

// ============================================
// State Management
// ============================================

const state = {
    goldPricePerOz: 0,           // Gold spot price in USD per troy ounce (Manual)
    goldPricePerGram: 0,         // Calculated from manual input
    exchangeRates: {},           // Cached exchange rates
    selectedCurrency: 'USD',     // Currently selected currency
    selectedSymbol: '$',         // Currency symbol
    lastUpdate: null,            // Last price update timestamp
    theme: 'dark'                // Current theme
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Header elements (Still updated manually)
    lastUpdate: document.getElementById('lastUpdate'),

    // Form elements
    ouncePriceInput: document.getElementById('ouncePriceInput'),
    tolaPriceInput: document.getElementById('tolaPriceInput'),
    countrySelect: document.getElementById('countrySelect'),
    weightInput: document.getElementById('weightInput'),
    weightUnit: document.getElementById('weightUnit'),
    puritySelect: document.getElementById('puritySelect'),
    calculateBtn: document.getElementById('calculateBtn'),
    errorMessage: document.getElementById('errorMessage'),

    // Result elements
    resultValue: document.getElementById('resultValue'),
    resultCurrency: document.getElementById('resultCurrency'),
    breakdownWeight: document.getElementById('breakdownWeight'),
    breakdownPurity: document.getElementById('breakdownPurity'),
    breakdownSpot: document.getElementById('breakdownSpot'),
    breakdownPurityFactor: document.getElementById('breakdownPurityFactor'),
    breakdownRate: document.getElementById('breakdownRate'),

    // Price table elements
    tableCurrency: document.getElementById('tableCurrency'),
    priceTableBody: document.getElementById('priceTableBody'),

    // Theme Toggle
    themeToggle: document.getElementById('themeToggle')
};

// ============================================
// API Functions
// ============================================

/**
 * Fetch exchange rates from Frankfurter API
 * Returns rates relative to USD
 * Merges with fallback rates for currencies not supported by Frankfurter
 */
async function fetchExchangeRates() {
    // Extended fallback rates (includes currencies not in Frankfurter API)
    const fallbackRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        PKR: 278,        // Pakistan - NOT in Frankfurter
        INR: 83,
        AED: 3.67,
        SAR: 3.75,
        CAD: 1.36,
        AUD: 1.53,
        JPY: 149,
        CNY: 7.24,
        CHF: 0.88,
        TRY: 30.5,
        MYR: 4.72,
        SGD: 1.34,
        HKD: 7.82,
        KRW: 1320,
        IDR: 15700,
        THB: 35.5,
        PHP: 56.5,
        BDT: 110,        // Bangladesh - NOT in Frankfurter
        EGP: 30.9,
        ZAR: 18.5,
        NGN: 1550,       // Nigeria - NOT in Frankfurter
        BRL: 4.97,
        MXN: 17.2,
        RUB: 92,
        PLN: 4.02,
        SEK: 10.5,
        NOK: 10.8,
        DKK: 6.88,
        NZD: 1.64,
        CZK: 22.8,
        HUF: 358,
        ILS: 3.65,
        KWD: 0.31,
        QAR: 3.64,       // Qatar - NOT in Frankfurter
        BHD: 0.38,
        OMR: 0.38,
        JOD: 0.71,
        MAD: 10.0,
        KES: 153,
        VND: 24500,      // Vietnam - NOT in Frankfurter
        LKR: 323,        // Sri Lanka - NOT in Frankfurter
        NPR: 133,        // Nepal - NOT in Frankfurter
        RON: 4.58,
        BGN: 1.80,
        ISK: 138
    };

    try {
        const response = await fetch(CONFIG.CURRENCY_API);

        if (!response.ok) {
            throw new Error('Currency API request failed');
        }

        const data = await response.json();

        // Merge: Start with fallback rates, then overlay API rates
        // This ensures currencies not in Frankfurter still work
        state.exchangeRates = { ...fallbackRates, ...data.rates, USD: 1 };

        console.log('Exchange rates loaded.');
        return true;

    } catch (error) {
        console.warn('Currency API error, using fallback rates:', error.message);
        state.exchangeRates = fallbackRates;
        return false;
    }
}

// ============================================
// Theme Management
// ============================================

/**
* Initialize theme from local storage or system preference
*/
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    const theme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    applyTheme(theme);
}

/**
* Apply theme to body and update toggle state
*/
function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
        document.body.classList.add('light-theme');
        if (elements.themeToggle) elements.themeToggle.checked = true;
    } else {
        document.body.classList.remove('light-theme');
        if (elements.themeToggle) elements.themeToggle.checked = false;
    }
}

/**
* Toggle theme between light and dark
*/
function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// ============================================
// UI Update Functions
// ============================================

/**
 * Handle Manual Ounce Price Input
 * Calculates Tola price and updates state
 */
function handleGoldInput() {
    const ouncePrice = parseFloat(elements.ouncePriceInput.value);

    if (isNaN(ouncePrice) || ouncePrice <= 0) {
        state.goldPricePerOz = 0;
        state.goldPricePerGram = 0;
        elements.tolaPriceInput.value = '';
        updatePriceDisplay();
        updatePriceTable();
        return; // Invalid input
    }

    // 1. Calculate Tola Price (USD)
    // Formula: (Ounce Price ÷ 31.1035) × 11.6638
    const tolaPriceUSD = (ouncePrice / CONFIG.GRAMS_PER_TROY_OZ) * CONFIG.GRAMS_PER_TOLA;

    // 2. Update Tola Input (Display)
    elements.tolaPriceInput.value = tolaPriceUSD.toFixed(2);

    // 3. Update State
    state.goldPricePerOz = ouncePrice;
    state.goldPricePerGram = ouncePrice / CONFIG.GRAMS_PER_TROY_OZ;
    state.lastUpdate = new Date();

    // 4. Update Header Ticker
    updatePriceDisplay();

    // 5. Trigger Main Calculation & Table Update
    updatePriceTable();
}

/**
 * Update the price display in header
 */
function updatePriceDisplay() {
    if (state.lastUpdate) {
        elements.lastUpdate.textContent = state.lastUpdate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Populate the country/currency dropdown
 */
function populateCountryDropdown() {
    // Sort countries alphabetically
    const sortedCountries = [...COUNTRIES].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Clear existing options
    elements.countrySelect.innerHTML = '';

    // Add countries
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.currency;
        option.dataset.symbol = country.symbol;
        option.textContent = `${country.name} (${country.currency})`;

        // Default to USD
        if (country.currency === 'USD') {
            option.selected = true;
        }

        elements.countrySelect.appendChild(option);
    });
}

/**
 * Update the price reference table
 */
function updatePriceTable() {
    if (state.goldPricePerGram === 0) {
        elements.priceTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Enter ${METAL_TYPE.toLowerCase()} price to see table</td></tr>`;
        elements.tableCurrency.textContent = state.selectedCurrency;
        return;
    }

    const karats = [24, 22, 21, 18, 14, 10];
    const exchangeRate = state.exchangeRates[state.selectedCurrency] || 1;

    let tableHTML = '';

    karats.forEach(karat => {
        const purityFactor = karat / 24;

        // Calculate prices
        const pricePerGram = state.goldPricePerGram * purityFactor * exchangeRate;
        const pricePerTola = pricePerGram * CONFIG.GRAMS_PER_TOLA;
        const pricePerOz = state.goldPricePerOz * purityFactor * exchangeRate;

        tableHTML += `
            <tr>
                <td><span class="karat-badge">${karat}K</span></td>
                <td>${state.selectedSymbol}${formatNumber(pricePerGram)}</td>
                <td>${state.selectedSymbol}${formatNumber(pricePerTola)}</td>
                <td>${state.selectedSymbol}${formatNumber(pricePerOz)}</td>
            </tr>
        `;
    });

    elements.priceTableBody.innerHTML = tableHTML;
    elements.tableCurrency.textContent = state.selectedCurrency;
}

/**
 * Show error message
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    elements.errorMessage.classList.add('hidden');
}

// ============================================
// Calculation Functions
// ============================================

/**
 * Convert weight to grams based on selected unit
 */
function convertToGrams(weight, unit) {
    switch (unit) {
        case 'gram':
            return weight;
        case 'tola':
            return weight * CONFIG.GRAMS_PER_TOLA;
        case 'ounce':
            return weight * CONFIG.GRAMS_PER_TROY_OZ;
        case 'kg':
            return weight * CONFIG.GRAMS_PER_KG;
        default:
            return weight;
    }
}

/**
 * Get unit label for display
 */
function getUnitLabel(unit, weight) {
    const labels = {
        gram: weight === 1 ? 'gram' : 'grams',
        tola: weight === 1 ? 'tola' : 'tolas',
        ounce: weight === 1 ? 'troy ounce' : 'troy ounces',
        kg: weight === 1 ? 'kilogram' : 'kilograms'
    };
    return labels[unit] || unit;
}

/**
 * Format number with appropriate decimals
 */
function formatNumber(num) {
    if (num >= 10000) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    } else if (num >= 100) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    }
}

/**
 * Main calculation function
 */
function calculateGoldPrice() {
    // Get input values
    const weight = parseFloat(elements.weightInput.value);
    const unit = elements.weightUnit.value;
    const karat = parseInt(elements.puritySelect.value);
    const currency = elements.countrySelect.value;

    // Validate inputs
    if (state.goldPricePerGram === 0) {
        showError(`Please enter the ${METAL_TYPE.toLowerCase()} Price per Ounce first`);
        return;
    }

    if (isNaN(weight) || weight <= 0) {
        showError('Please enter a valid weight greater than 0');
        return;
    }

    // Get exchange rate
    const exchangeRate = state.exchangeRates[currency] || 1;

    // Get currency symbol
    const selectedOption = elements.countrySelect.options[elements.countrySelect.selectedIndex];
    const symbol = selectedOption?.dataset.symbol || '$';

    // Convert weight to grams
    const weightInGrams = convertToGrams(weight, unit);

    // Calculate purity factor
    const purityFactor = karat / 24;

    // Calculate final price
    // Base: state.goldPricePerGram (calculated from Manual Ounce Input)
    const finalPrice = (state.goldPricePerGram * weightInGrams * purityFactor) * exchangeRate;

    // Update result display
    elements.resultValue.textContent = `${symbol}${formatNumber(finalPrice)}`;
    elements.resultCurrency.textContent = currency;

    // Update breakdown
    elements.breakdownWeight.textContent = `${weight} ${getUnitLabel(unit, weight)}`;
    elements.breakdownPurity.textContent = METAL_TYPE === 'GOLD' ? `${karat}K` : 'Pure Silver';
    elements.breakdownSpot.textContent = `$${state.goldPricePerGram.toFixed(2)}`;
    elements.breakdownPurityFactor.textContent = purityFactor.toFixed(3);
    elements.breakdownRate.textContent = `1 USD = ${exchangeRate.toFixed(2)} ${currency}`;

    // Hide any previous errors
    hideError();
}

// ============================================
// Event Handlers
// ============================================

function handleCurrencyChange() {
    const currency = elements.countrySelect.value;
    const selectedOption = elements.countrySelect.options[elements.countrySelect.selectedIndex];

    state.selectedCurrency = currency;
    state.selectedSymbol = selectedOption?.dataset.symbol || '$';

    updatePriceTable();
}

function handleFormSubmit(event) {
    event.preventDefault();
    calculateGoldPrice();
}

// ============================================
// Initialization
// ============================================

async function init() {
    console.log(`Initializing Manual ${METAL_TYPE} Price Calculator...`);

    initTheme();
    populateCountryDropdown();

    // Fetch currency rates only
    await fetchExchangeRates();

    // Set initial display for gold prices
    updatePriceDisplay();
    updatePriceTable();

    // Set up event listeners
    elements.ouncePriceInput.addEventListener('input', handleGoldInput); // Auto-calc on input
    elements.countrySelect.addEventListener('change', handleCurrencyChange);
    document.getElementById('goldCalculatorForm').addEventListener('submit', handleFormSubmit);

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('change', toggleTheme);
    }

    // Calculations now ONLY happen on Form Submit (Calculate Button)
    // No more auto-calculation on input to prevent result showing too early

    console.log('Setup complete. Waiting for user input.');
}

document.addEventListener('DOMContentLoaded', init);
