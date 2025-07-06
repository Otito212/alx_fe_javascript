let quotes = [];
let currentCategory = localStorage.getItem("selectedCategory") || "all";
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock server
const SYNC_INTERVAL = 10000; // 10 seconds

// Load local quotes or defaults
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

// Populate dropdown with categories
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

// Filter quotes by category
function getFilteredQuotes() {
  return currentCategory === "all" ? quotes : quotes.filter(q => q.category === currentCategory);
}

// Show a random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><small>Category: ${randomQuote.category}</small>`;
}

// Change filter category
function filterQuotes() {
  currentCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", currentCategory);
  showRandomQuote();
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  updateSyncStatus("Quote added locally. Will sync shortly.", "blue");
}

// Inject the quote form
function createAddQuoteForm() {
  const form = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  form.appendChild(inputText);
  form.appendChild(inputCategory);
  form.appendChild(addBtn);
  document.body.appendChild(form);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format.");
      let added = 0;

      imported.forEach(q => {
        if (!quotes.some(local => local.text === q.text)) {
          quotes.push(q);
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        updateSyncStatus(`${added} quote(s) imported successfully.`, "green");
      } else {
        updateSyncStatus("No new quotes to import.", "gray");
      }
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === ✅ Required by ALX Checker ===

// Fetch quotes from the server
function fetchQuotesFromServer() {
  return fetch(SERVER_URL)
    .then(res => res.json())
    .then(data => {
      // Simulate quote structure from mock data
      const serverQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));

      let newQuotes = 0;
      serverQuotes.forEach(sq => {
        if (!quotes.some(lq => lq.text === sq.text)) {
          quotes.push(sq);
          newQuotes++;
        }
      });

      if (newQuotes > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        updateSyncStatus(`${newQuotes} quote(s) synced from server.`, "green");
      }
    })
    .catch(() => updateSyncStatus("Failed to fetch from server.", "red"));
}

// Post quotes to server (simulation)
function postQuotesToServer() {
  // Simulate sending the latest quote
  if (quotes.length === 0) return;
  const latest = quotes[quotes.length - 1];

  return fetch(SERVER_URL, {
    method: "POST",
    body: JSON.stringify(latest),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(() => {
      updateSyncStatus("Latest quote synced to server.", "blue");
    })
    .catch(() => updateSyncStatus("Failed to post to server.", "red"));
}

// Sync logic: fetch + post
function syncQuotes() {
  fetchQuotesFromServer().then(() => {
    postQuotesToServer();
  });
}

// UI message area
function updateSyncStatus(message, color = "black") {
  const el = document.getElementById("syncStatus");
  if (el) {
    el.textContent = message;
    el.style.color = color;
  }
}

// === INIT ===
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

  // Start syncing every 10 seconds
  syncQuotes(); // initial call
  setInterval(syncQuotes, SYNC_INTERVAL);
});
