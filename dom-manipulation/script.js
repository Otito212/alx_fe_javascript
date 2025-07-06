// Define an initial array of quotes with text and category
const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Life" },
    { text: "It's not whether you get knocked down, it's whether you get up.", category: "Perseverance" },
  ];
  
  // Function to display a random quote
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
  
    // Update the DOM using innerHTML
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${selectedQuote.text}"</p><small>Category: ${selectedQuote.category}</small>`;
  }
  
  // Function to add a new quote
  function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
  
    if (newQuoteText === "" || newQuoteCategory === "") {
      alert("Please enter both quote text and category.");
      return;
    }
  
    // Add new quote object to the quotes array
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
  
    // Optionally clear inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  
    // Optionally show the newly added quote
    showRandomQuote();
  }
  
  // Add event listener to "Show New Quote" button
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  });
  