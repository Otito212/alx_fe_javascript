let quotes = [];
let currentCategory = localStorage.getItem("selectedCategory") || "all";
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // mock API
const SYNC_INTERVAL = 10000; // 10 seconds

// Load from localStorage or set defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don't let yesterday take up too much of today.", category: "Life" },
      { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" },
    ];
    saveQuotes();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories in dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
  dropdown.value = currentCategory;
}

// Get filtered quotes
function getFilteredQuotes() {
  if (currentCategory === "all") return quotes;
  return quotes.filter(q => q.category === currentCategory);
}

// Display a quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }
  const selectedQuote = filtered[Math.floor(Math.random() * filtered.length)];
  sessionStorage.setItem("lastQuote", JSON.stringify(selectedQuote));
  document.getElementById("quoteDisplay").innerHTML = `<p>"${selectedQuote.text}"</p><small>Category: ${selectedQuote.category}</small>`;
}

// Handle filter change
function filterQuotes() {
  currentCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", currentCategory);
  showRandomQuote();
}

// Add new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();
  if (!quoteText || !quoteCategory) {
    alert("Please fill in both quote and category.");
    return;
  }
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added locally. Will sync to server.");
}

// Create input form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

// Sync data with simulated server (read-only)
function syncWithServer() {
  fetch(SERVER_URL)
    .then(response => response.json())
    .then(data => {
      const serverQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      let conflictsResolved = 0;
      let newQuotesAdded = 0;

      serverQuotes.forEach(serverQuote => {
        const exists = quotes.some(localQuote => localQuote.text === serverQuote.text);
        if (!exists) {
          quotes.push(serverQuote);
          newQuotesAdded++;
        }
      });

      if (newQuotesAdded > 0) {
        alert(`${newQuotesAdded} new quote(s) added from server.`);
        saveQuotes();
        populateCategories();
        filterQuotes();
      }
    })
    .catch(error => {
      console.error("Failed to sync with server:", error);
    });
}

// Export to file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import quotes
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON");
      importedQuotes.forEach(quote => {
        const exists = quotes.some(q => q.text === quote.text);
        if (!exists) quotes.push(quote);
      });
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      filterQuotes();
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
  } else {
    filterQuotes();
  }

  // Start syncing
  syncWithServer(); // first sync on load
  setInterval(syncWithServer, SYNC_INTERVAL); // periodic sync
});
