// Define QuerySelectors
const table = document.querySelector("table");
const tbody = table.querySelector("tbody");
const th = table.querySelector("th");
const URL_Pokemon = "https://pokeapi.co/api/v2/pokemon/";
const URL_Abilities = "https://pokeapi.co/api/v2/ability/";
const URL_Items = "https://pokeapi.co/api/v2/item/";
const URL_Berries = "https://pokeapi.co/api/v2/berry/";
const URL_Locations = "https://pokeapi.co/api/v2/location/";

const sideNavLinks = document.querySelectorAll(".side-nav-link");
const pokemonLink = document.querySelector("#pokemon-link");
const loadingScreen = document.querySelector(".spinner");
const tables = document.querySelectorAll("table");

// Define sidebar options
const options = {
  pokemon: {
    columns: ["ID", "Name", "Type", "Height", "Weight", "Image"],
    class: "pokemon-table",
  },
  abilities: {
    columns: ["ID", "Name", "Effect", "Generation", "Number of Pokemons"],
    class: "abilities-table",
  },
  berries: {
    columns: [
      "ID",
      "Name",
      "Growth Time",
      "Size",
      "Smoothness",
      "Natural Gift Power",
    ],
    class: "berries-table",
  },
  items: {
    columns: ["ID", "Name", "Cost", "Fling Power", "Category", "Image"],
    class: "items-table",
  },
  locations: {
    columns: ["ID", "Name", "Game Index", "Generation", "Area"],
    class: "locations-table",
  },
};

// Cache DOM queries
const pokemonTable = tables[0];
const berriesTable = tables[1];
const abilitiesTable = tables[2];
const itemsTable = tables[3];
const locationsTable = tables[4];

// Set Pokemon option as active
setActiveLink(pokemonLink);
const option = "pokemon";
fetchData(option);

// Event Listener
document.addEventListener("click", (event) => {
  const link = event.target.closest(".side-nav-link");
  if (!link) return;

  event.preventDefault();
  setActiveLink(link);
  const option = link.id.replace("-link", "");
  fetchData(option);
});

// Create a row
function createRow(data, columns) {
  const newRow = document.createElement("tr");
  newRow.innerHTML = columns
    .map((column) => `<td>${data[column]}</td>`)
    .join("");
  return newRow;
}

// Updating Table
function updateTable(option) {
  tbody.innerHTML = "";

  // Get the option columns and class
  const columns = options[option].columns;
  const tableClass = options[option].class;

  // Set the table class
  table.className = tableClass;

  // Create the column headers
  const headerRow = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.appendChild(th);
  });
  tbody.appendChild(headerRow);
}

function setActiveLink(link) {
  sideNavLinks.forEach((link) => link.classList.remove("active"));
  link.classList.add("active");
}

function getURL(option) {
  switch (option) {
    case "pokemon":
      return URL_Pokemon;
    case "abilities":
      return URL_Abilities;
    case "berries":
      return URL_Berries;
    case "items":
      return URL_Items;
    case "locations":
      return URL_Locations;
    default:
  }
}

// Use async/await to fetch data
async function fetchData(option) {
  const base_url = getURL(option);

  try {
    const allData = [];

    // Use a for loop to generate URLs with index and fetch data from API
    for (let i = 1; i <= 25; i++) {
      const url = `${base_url}${i}`;

      const response = await fetch(url);

      if (!response.ok) {
        // Handle non-200 response status codes
        console.log(`Request failed with status code ${response.status}`);
        continue; // Continue to next iteration
      }
      const data = await response.json();
      const results = data?.results || [];
      // Push the data into the array
      allData.push(data);
    }

    updateTable(option);
    displayData(allData, option);
  } catch (error) {
    console.error(error);
  }

  function displayData(allData, option) {
    // Get the table columns
    const columns = options[option].columns;

    // Clear the table body
    tbody.innerHTML = "";

    // Generate table headers dynamically
    const thElements = columns.map((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      return th;
    });

    // Add the headers to the table
    const headerRow = document.createElement("tr");
    thElements.forEach((th) => headerRow.appendChild(th));
    tbody.appendChild(headerRow);

    // Create a row for each item in the data
    allData.forEach((item, index) => {
      const url = `${getURL(option)}${index + 1}/`;
      const row = createRow(
        {
          ID: item.id,
          ...(option === "pokemon" && {
            Name: item.name.replace("-", " "),
            Type: item.types[0].type.name,
            Height: item.height,
            Weight: item.weight,
            Image: `<img src="${item.sprites.front_default}" />`,
          }),
          ...(option === "abilities" && {
            Name: item.name.replace("-", " "),
            Effect: item.effect_entries[1].short_effect,
            Generation: item.generation.name
              .replace("generation-", "")
              .toUpperCase(),
            "Number of Pokemons": item.pokemon.length,
          }),
          ...(option === "berries" && {
            Name: item.name.replace("-", " "),
            "Growth Time": `${item.growth_time} hours`,
            Size: item.size,
            Smoothness: item.smoothness,
            "Natural Gift Power": item.natural_gift_power,
          }),
          ...(option === "items" && {
            Name: item.name.replace("-", " "),
            Cost: item.cost,
            "Fling Power": item.fling_power !== null ? item.fling_power : 0,
            Category: item.category.name.replace("-", " "),
            Image: `<img src="${item.sprites.default}" alt="${item.name}" />`,
          }),
          ...(option === "locations" && {
            Name: item.names[0].name,
            "Game Index": item.game_indices[0].game_index,
            Generation: item.game_indices[0].generation.name
              .replace("generation-", "")
              .toUpperCase(),
            Area: item.areas[0].name.replace(/-/g, " "),
          }),
        },
        columns
      );

      tbody.appendChild(row);
    });
  }
}
