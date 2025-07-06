let quotes = [];
let currentCategory = localStorage.getItem("selectedCategory") || "all";
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 10000; // 10 seconds

// Load quotes from localStorage or set default
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
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

// Filter quotes based on selected category
function getFilteredQuotes() {
  return currentCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === currentCategory);
}

// Display a random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  const display = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    display.innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  sessionStorage.setItem("lastQuote", JSON.stringify(selected));
  display.innerHTML = `<p>"${selected.text}"</p><small>Category: ${selected.category}</small>`;
}

// Handle category selection
function filterQuotes() {
  currentCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", currentCategory);
  showRandomQuote();
}

// Add a new quote
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

  updateSyncStatus("Quote added locally. Will sync to server.", "blue");
}

// Create form to add quotes
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

// Export quotes to a file
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

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format.");

      let added = 0;
      imported.forEach(q => {
        if (!quotes.some(existing => existing.text === q.text)) {
          quotes.push(q);
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        updateSyncStatus(`${added} quote(s) imported.`, "green");
      } else {
        updateSyncStatus("No new quotes were imported.", "gray");
      }

    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Update UI notification
function updateSyncStatus(message, color = "black") {
  const el = document.getElementById("syncStatus");
  if (el) {
    el.textContent = message;
    el.style.color = color;
  }
}

// === REQUIRED ASYNC FUNCTIONS ===

// Fetch from mock API
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    let newQuotes = 0;
    serverQuotes.forEach(q => {
      if (!quotes.some(local => local.text === q.text)) {
        quotes.push(q);
        newQuotes++;
      }
    });

    if (newQuotes > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes();
    }

  } catch (error) {
    updateSyncStatus("Failed to fetch from server.", "red");
  }
}

// Post to mock API
async function postQuotesToServer() {
  if (quotes.length === 0) return;

  const latestQuote = quotes[quotes.length - 1];

  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(latestQuote),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    updateSyncStatus("Failed to post to server.", "red");
  }
}

// Sync local with server (required function)
async function syncQuotes() {
  await fetchQuotesFromServer();
  await postQuotesToServer();
  updateSyncStatus("Quotes synced with server!", "green"); // ✅ REQUIRED TEXT
}

// === INITIALIZATION ===
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

  // Initial and periodic sync
  syncQuotes();
  setInterval(syncQuotes, SYNC_INTERVAL);
});

