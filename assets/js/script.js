const data = [
  {
    id: "1",
    title: "Fix login bug on mobile",
    author: "Anna",
    severity: "High",
    status: "open",
  },
  {
    id: "2",
    title: "Update UI colors for dark mode",
    author: "John",
    severity: "Low",
    status: "closed",
  },
  {
    id: "3",
    title: "Update UI colors for dark mode 2",
    author: "John",
    severity: "Low",
    status: "open",
  },
  {
    id: "4",
    title: "Update UI colors for dark mode 3",
    author: "John",
    severity: "Low",
    status: "closed",
  },
];
const dataPage1 = [
  {
    id: "1",
    title: "Fix login bug on mobile",
    author: "Anna",
    severity: "High",
    status: "open",
  },
  {
    id: "2",
    title: "Update UI colors for dark mode",
    author: "John",
    severity: "Low",
    status: "closed",
  },
  {
    id: "3",
    title: "Update UI colors for dark mode 2",
    author: "John",
    severity: "Low",
    status: "open",
  },
];
const dataPage2 = [
  {
    id: "4",
    title: "Update UI colors for dark mode 3",
    author: "John",
    severity: "Low",
    status: "closed",
  },
];

function addIssue(issues, issue) {
  // issues.unshift(issue);
  return [issue, ...issues];
}

function deleteIssue(issues, id) {
  return issues.filter((issue) => issue.id !== id);
}

function toggleIssueStatus(issues, id) {
  return issues.map((issue) =>
    issue.id === id
      ? { ...issue, status: issue.status === "open" ? "closed" : "open" }
      : issue
  );
}

async function loadHTML(id, file) {
  await fetch(file)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById(id).innerHTML = html;
    });
}

async function initForm(currentIssues, setIssues) {
  await loadHTML("form-container", "pages/add-new-issues.html");
  const form = document.getElementById("issue-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("issue-title").value.trim();
    const author = document.getElementById("issue-author").value;
    const severity = document.getElementById("issue-severity").value;

    if (title) {
      const newIssue = {
        id: crypto.randomUUID(),
        title,
        author,
        severity,
        status: "open",
      };

      const updatedIssues = addIssue(currentIssues(), newIssue);
      setIssues(updatedIssues);
      form.reset();
      renderIssues(updatedIssues, setIssues);
    }
  });
}

async function renderIssues(issues, setIssues) {
  await loadHTML("issues-container", "pages/issue-list.html");
  const container = document.getElementById("issue-list");
  const template = document.getElementById("issue-template");

  if (!container || !template) return;

  container.innerHTML = "";

  const totalItems = issues.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = issues.slice(start, start + itemsPerPage);

  pageItems.forEach((issue) => {
    const node = template.content.cloneNode(true);

    node.querySelector(".issue-title").textContent = issue.title;
    node.querySelector(".issue-author").textContent = issue.author;
    node.querySelector(".issue-severity").textContent = issue.severity;

    const statusEl = node.querySelector(".issue-status");
    const toggleBtn = node.querySelector(".btn-close");
    const deleteBtn = node.querySelector(".btn-delete");

    if (issue.status === "closed") {
      statusEl.textContent = "CLOSED";
      statusEl.classList.remove("bg-green-100", "text-green-700");
      statusEl.classList.add("bg-gray-300", "text-gray-600");

      toggleBtn.textContent = "Open";
      toggleBtn.classList.remove("bg-yellow-500", "hover:bg-yellow-600");
      toggleBtn.classList.add("bg-green-500", "hover:bg-green-600");
    } else {
      statusEl.textContent = "OPEN";
      statusEl.classList.remove("bg-gray-300", "text-gray-600");
      statusEl.classList.add("bg-green-100", "text-green-700");

      toggleBtn.textContent = "Close";
      toggleBtn.classList.remove("bg-green-500", "hover:bg-green-600");
      toggleBtn.classList.add("bg-yellow-500", "hover:bg-yellow-600");
    }

    toggleBtn.onclick = () => {
      const updated = toggleIssueStatus(issues, issue.id);
      setIssues(updated);
      renderIssues(updated, setIssues);
    };

    deleteBtn.onclick = () => {
      const updated = deleteIssue(issues, issue.id);
      setIssues(updated);
      renderIssues(updated, setIssues);
    };

    container.appendChild(node);
    renderPagination(currentPage, totalPages);
  });
}

async function fetchIssues() {
  const response = await fetch("assets/data/issues.json");
  const data = await response.json();
  return data;
}

function sortIssuesByTitle(issues, order) {
  const sorted = [...issues];
  sorted.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();

    if (order === "asc") {
      return titleA.localeCompare(titleB);
    } else {
      return titleB.localeCompare(titleA);
    }
    // if (order === "asc") {
    //   return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
    // } else {
    //   return titleA > titleB ? -1 : titleA < titleB ? 1 : 0;
    // }
  });

  return sorted;
}

function filterSearchAndSortIssues(issues, keyword, status, order) {
  const lowerKeyword = keyword.trim().toLowerCase();

  const filtered = issues.filter((issue) => {
    const matchTitle = issue.title.toLowerCase().includes(lowerKeyword);
    const matchStatus = status === "all" || issue.status === status;
    return matchTitle && matchStatus;
  });

  return sortIssuesByTitle(filtered, order);
}

function setupFilters(getIssues, setIssues) {
  const searchInput = document.getElementById("search-input");
  const statusSelect = document.getElementById("status-filter");
  const sortSelect = document.getElementById("sort-order");

  if (!searchInput || !statusSelect || !sortSelect) return;

  const applyFilters = () => {
    const keyword = searchInput.value;
    const status = statusSelect.value;
    const order = sortSelect.value;

    const filtered = filterSearchAndSortIssues(
      getIssues(),
      keyword,
      status,
      order
    );
    renderIssues(filtered, setIssues);
  };

  searchInput.addEventListener("input", applyFilters);
  statusSelect.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
}

function changePage(direction) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  setCurrentPage(Math.max(1, Math.min(currentPage + direction, totalPages)));
  renderItems();
}

function renderPagination(currentPage, totalPages) {
  const container = document.getElementById("pagination-content");
  if (!container) return;

  document.getElementById("pagination-start-item").textContent =
    (currentPage - 1) * itemsPerPage + 1;
  document.getElementById("pagination-end-item").textContent =
    (currentPage - 1) * itemsPerPage + 1;
  document.getElementById("pagination-total-item").textContent =
    getIssues().length;

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <a onclick="goToPage(${i})"
        class="cursor-pointer relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
          i === currentPage
            ? "text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-blue-500 bg-blue-500 z-10"
            : "text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-offset-0"
        }">
        ${i}
      </a>`;
  }

  container.innerHTML = html;
}

function changePage(offset) {
  const totalPages = Math.ceil(getIssues().length / itemsPerPage);
  currentPage = Math.min(Math.max(1, currentPage + offset), totalPages);
  renderIssues(getIssues(), setIssues);
}

function goToPage(page) {
  const totalPages = Math.ceil(getIssues().length / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderIssues(getIssues(), setIssues);
  }
}

// State management
// let issues = initialIssues;
let issues = [];
const getIssues = () => issues;
const setIssues = (newIssues) => {
  issues = newIssues;
};

const itemsPerPage = 3;
let currentPage = 1;
const setCurrentPage = (newpage) => {
  currentPage = newpage;
};

let totalPages = 2;
const setTotalPages = (total) => {
  totalPages = total;
};

// Init
fetchIssues().then((data) => {
  setIssues(data);
  initForm(getIssues, setIssues);
  renderIssues(getIssues(), setIssues);
  setupFilters(getIssues, setIssues);
});
