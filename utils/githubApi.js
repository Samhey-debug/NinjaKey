// utils/githubApi.js
import fetch from 'node-fetch';

const GITHUB_REPO = 'Samhey-debug/KeySystem';
const GITHUB_BRANCH = 'main';

async function githubRequest(method, path, body) {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

export async function createFile(filename) {
  return githubRequest('PUT', `${filename}.txt`, {
    message: `Create ${filename}.txt`,
    content: Buffer.from('').toString('base64'),
    branch: GITHUB_BRANCH
  });
}

export async function updateFile(filename, content, sha) {
  return githubRequest('PUT', `${filename}.txt`, {
    message: `Update ${filename}.txt`,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: GITHUB_BRANCH
  });
}

export async function getFile(filename) {
  return githubRequest('GET', `${filename}.txt`);
}

export async function deleteFile(filename, sha) {
  return githubRequest('DELETE', `${filename}.txt`, {
    message: `Delete ${filename}.txt`,
    sha,
    branch: GITHUB_BRANCH
  });
}

// New function: Fetch and parse passwords.txt to validate db passwords
export async function validateDatabasePassword(dbname, password) {
  const fileData = await getFile('passwords');
  const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const dbPasswords = content.split('\n').map(line => line.trim().split(':'));
  const match = dbPasswords.find(([name, pass]) => name === dbname);

  return match && match[1] === password;
}