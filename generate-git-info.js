// generate-git-info.js
import { execSync } from "child_process";
import fs from "fs";

// Function to format date as yyyy/mm/dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

const gitInfo = {
  VITE_COMMIT_REF: execSync("git rev-parse --short HEAD").toString().trim(),
  VITE_BRANCH: execSync("git rev-parse --abbrev-ref HEAD").toString().trim(),
  VITE_BUILD_DATE: formatDate(new Date()),
};

// Write to a JSON file
fs.writeFileSync("git-info.json", JSON.stringify(gitInfo, null, 2));
