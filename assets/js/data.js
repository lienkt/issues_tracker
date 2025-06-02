let issues = [
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
];

function addIssue(issue) {
  issues.unshift(issue);
}

function deleteIssue(id) {
  issues = issues.filter((issue) => issue.id !== id);
}

function closeIssue(id) {
  const issue = issues.find((issue) => issue.id === id);
  if (issue) issue.status = "closed";
}
