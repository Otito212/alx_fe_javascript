// Define the quotes array
const quotes = [
    { text: "Believe you can and you're halfway there.", category: "Motivation" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Success is not in what you have, but who you are.", category: "Success" },
];

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText === "" || newQuoteCategory === "") {
        alert("Please fill in both the quote and category.");
        return;
    }

    // Add new quote to the array
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    quotes.push(newQuote);

    // Clear the input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    // Optionally show the new quote immediately
    showRandomQuote();
}

// Set up event listener for the "Show New Quote" button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
});
