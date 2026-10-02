// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = "http://localhost:3000/api/expenses";
let allExpenses = [];


function showSpinner() {
  document.getElementById("loadingSpinner").classList.remove("d-none");
}

function hideSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
}
///////////////////////////////////get 
async function getExpenses() {
  showSpinner();

  try {
    const response = await fetch(API_URL);
    const expenses = await response.json();

    if (!response.ok) {
      showAlert("Failed to load expenses");
      return [];
    }

    return expenses;

  } catch (error) {
    showAlert("Cannot connect to server");
    return [];

  } finally {
    hideSpinner();
  }
}

//////////////////////////////////////// ADD
async function addExpense(data) {
    showSpinner();
  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) {
     showAlert(result.message);
     return null;
    }

    return result;
  }     catch (error) {
    showAlert("Cannot connect to server");
    return null;

  } finally {
    hideSpinner();
  }   
}

///////////////////////////////////// DELETE
async function deleteExpense(id) {
    showSpinner();
  try {
    const response = await fetch(API_URL + "/" + id, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message);
      return null;
    }

    return result;

  } catch (error) {
    showAlert("Cannot connect to server");
    return null;

  } finally {
    hideSpinner();
  }
}


///////////////////////////////////////UPDATE
async function updateExpense(id, data) {
    showSpinner();
  try {
    const response = await fetch(API_URL + "/" + id, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert(result.message);
      return null;
    }

    return result;

  } catch (error) {
    showAlert("Cannot connect to server");
    return null;

  } finally {
    hideSpinner();
  }
}

/////////////////////////////////// Rrender table
let editingId = null;
function renderTable(list) {
  const tableBody = document.getElementById("expensesTableBody");
  
  tableBody.innerHTML = "";

  list.forEach(function(expense) {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = expense.title;

    const amountCell = document.createElement("td");
    amountCell.textContent = expense.amount;

    const categoryCell = document.createElement("td");
    const categoryBadge = document.createElement("span");
    categoryBadge.textContent = expense.category;
   if (expense.category === "Food") {
  categoryBadge.className = "badge bg-success";
  } else if (expense.category === "Transport") {
  categoryBadge.className = "badge bg-primary";
} else if (expense.category === "Bills") {
  categoryBadge.className = "badge bg-warning text-dark";
} else if (expense.category === "Entertainment") {
  categoryBadge.className = "badge bg-info text-dark";
} else {
  categoryBadge.className = "badge bg-secondary";
}

    categoryCell.appendChild(categoryBadge);

    const dateCell = document.createElement("td");
    dateCell.textContent = expense.date;

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "btn btn-warning btn-sm me-2";

    editButton.addEventListener("click", function() {
        editingId = expense.id;
    document.getElementById("editTitle").value = expense.title;
    document.getElementById("editAmount").value = expense.amount;
    document.getElementById("editCategory").value = expense.category;

    const dateParts = expense.date.split("-");
    document.getElementById("editDate").value =
    dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
    });


    ///////////////////////////////delete
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "btn btn-danger btn-sm";

    deleteButton.addEventListener("click", async function() {
     const result = await deleteExpense(expense.id);

      if (result) {
        await refresh();
      }
    });
    

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton); 
    row.appendChild(titleCell);
    row.appendChild(amountCell);
    row.appendChild(categoryCell);
    row.appendChild(dateCell); 
    row.appendChild(actionsCell);

    tableBody.appendChild(row);

  });}




  function renderSummary(list) {
  const totalAmount = document.getElementById("totalAmount");
  const expenseCount = document.getElementById("expenseCount");
  const highestExpense = document.getElementById("highestExpense");

  let total = 0;
  let highest = 0;

  list.forEach(function(expense) {
    total = total + expense.amount;

    if (expense.amount > highest) {
      highest = expense.amount;
    }
  });

  totalAmount.textContent = total;
  expenseCount.textContent = list.length;
  highestExpense.textContent = highest;
}


  async function refresh() {
  const expenses = await getExpenses();
  allExpenses = expenses;
  renderTable(expenses);
  renderSummary(expenses);
}

/////////////////////////////////// Search (Bonus)
const searchTitle = document.getElementById("searchTitle");

searchTitle.addEventListener("input", function() {
  const searchText = searchTitle.value.toLowerCase();

  const searchResults = allExpenses.filter(function(expense) {
    return expense.title.toLowerCase().includes(searchText);
  });

  renderTable(searchResults);
});
//////////////////////////////////// FILTER

const filterCategory = document.getElementById("filterCategory");

filterCategory.addEventListener("change", function() {
  const selectedCategory = filterCategory.value;

  if (selectedCategory === "All") {
    renderTable(allExpenses);
  } else {
    const filteredExpenses = allExpenses.filter(function(expense) {
      return expense.category === selectedCategory;
    });

    renderTable(filteredExpenses);
  }
});

function showAlert(message) {
  const alertContainer = document.getElementById("alertContainer");

  alertContainer.innerHTML = `
    <div class="alert alert-danger" role="alert">
      ${message}
    </div>
  `;
}


/////////////////////////////////// Add event ==> (add to form)
const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  
  if (title.trim() === "" || amount <= 0 || category === "" || date === "") {
  showAlert("Please enter valid expense data");
  return;
}

  const data = {
    title: title,
    amount: amount,
    category: category,
    date: date
  };
const result = await addExpense(data);

if (result) {
  expenseForm.reset();
  await refresh();
}
});
//////////////////////////////////ُ Edit 
const saveEditButton = document.getElementById("saveEditButton");

saveEditButton.addEventListener("click", async function() {
  const title = document.getElementById("editTitle").value;
  const amount = Number(document.getElementById("editAmount").value);
  const category = document.getElementById("editCategory").value;
  const date = document.getElementById("editDate").value;

  if (title.trim() === "" || amount <= 0 || category === "" || date === "") {
  showAlert("Please enter valid expense data");
  return;
  }

  const data = {
    title: title,
    amount: amount,
    category: category,
    date: date
  };

 const result = await updateExpense(editingId, data);

if (result) {
  await refresh();

  bootstrap.Modal.getInstance(
    document.getElementById("editModal")
  ).hide();
}
});

const darkModeSwitch = document.getElementById("darkModeSwitch");

darkModeSwitch.addEventListener("change", function() {
  if (darkModeSwitch.checked) {
    document.body.setAttribute("data-bs-theme", "dark");
  } else {
    document.body.setAttribute("data-bs-theme", "light");
  }
});
  refresh();