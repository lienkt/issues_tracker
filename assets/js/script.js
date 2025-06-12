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

  issues.forEach((issue) => {
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

// State management
// let issues = initialIssues;
let issues = [];
const getIssues = () => issues;
const setIssues = (newIssues) => {
  issues = newIssues;
};

// Init
fetchIssues().then((data) => {
  setIssues(data);
  initForm(getIssues, setIssues);
  renderIssues(getIssues(), setIssues);
  setupFilters(getIssues, setIssues);
});
