// Initial array of quote objects
const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Life" },
    { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" },
  ];
  
  // Function to display a random quote
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
  
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${selectedQuote.text}"</p><small>Category: ${selectedQuote.category}</small>`;
  }
  
  // Function to add a new quote
  function addQuote() {
    const textInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
    const quoteText = textInput.value.trim();
    const quoteCategory = categoryInput.value.trim();
  
    if (quoteText === "" || quoteCategory === "") {
      alert("Please fill in both quote and category.");
      return;
    }
  
    quotes.push({ text: quoteText, category: quoteCategory });
  
    // Clear inputs
    textInput.value = "";
    categoryInput.value = "";
  
    // Optionally show a random quote
    showRandomQuote();
  }
  
  // Function to programmatically create the quote form
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
  
  // Load page
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    createAddQuoteForm(); // Must be called dynamically
  });
  