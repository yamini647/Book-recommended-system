// Function to generate a random hex color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to change the body background with a linear gradient
function changeBackground() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  document.body.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
}

// Set initial background and then change it every 10 seconds
document.addEventListener('DOMContentLoaded', () => {
  changeBackground(); // Set initial background
  setInterval(changeBackground, 10000); // Change every 10 seconds (10000 milliseconds)
});


async function searchBooks() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>🔍 Searching...</p>";

  if (!query) {
    resultsDiv.innerHTML = "<p>Please enter a book name.</p>";
    return;
  }

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    const books = data.docs.slice(0, 20);

    if (!books.length) {
      resultsDiv.innerHTML = "<p>No books found.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    books.forEach(book => {
      // Function to get the most likely valid cover URL
      function getValidCoverUrl(book) {
        if (book.cover_i) {
          return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.cover_edition_key) {
          return `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
        } else if (book.isbn && book.isbn.length > 0) {
          return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
        } else {
          return "https://via.placeholder.com/80x120?text=No+Cover";
        }
      }

      const coverUrl = getValidCoverUrl(book);

      // Create image element and set up fallback
      const img = new Image();
      img.src = coverUrl;
      img.alt = "Cover Image";
      img.className = "book-cover";
      img.loading = "lazy";
      img.onerror = () => {
        img.onerror = null;
        img.src = "https://via.placeholder.com/80x120?text=No+Cover";
      };

      // Create details
      const details = document.createElement("div");
      details.className = "book-details";
      details.innerHTML = `
        <strong>Title:</strong> ${book.title}<br>
        <strong>Author:</b> ${book.author_name?.join(", ") || "Unknown"}<br>
        <strong>Language:</strong> ${book.language?.join(", ") || "N/A"}<br>
        <strong>First Published:</strong> ${book.first_publish_year || "N/A"}
      `;

      // Put it together
      const div = document.createElement("div");
      div.className = "book";
      div.appendChild(img);
      div.appendChild(details);

      fragment.appendChild(div);
    });

    resultsDiv.innerHTML = "";
    resultsDiv.appendChild(fragment);

  } catch (error) {
    console.error("Fetch error:", error);
    resultsDiv.innerHTML = "<p>⚠️ Error loading books. Try again later.</p>";
  }
}
