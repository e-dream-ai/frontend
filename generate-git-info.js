/* eslint-disable no-undef */
// generate-git-info.js
import { execSync } from "child_process";
import fs from "fs";

// Function to get date
function getDate() {
  return new Date().toISOString();
}

// Function to get the branch name
function getBranchName() {
  // Check for netlify CI environment variables first
  if (process.env.NETLIFY) {
    return process.env.BRANCH || process.env.HEAD || "unknown";
  }

  // Fallback to Git command for local development
  try {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch (error) {
    console.error("Error getting branch name:", error);
    return "unknown";
  }
}

const gitInfo = {
  VITE_COMMIT_REF: execSync("git rev-parse --short HEAD").toString().trim(),
  VITE_BRANCH: getBranchName(),
  VITE_BUILD_DATE: getDate(),
};

// Write to a JSON file
fs.writeFileSync("git-info.json", JSON.stringify(gitInfo, null, 2));
