// /api/passwords/set.js
import { getFile, updateFile, validateDatabasePassword } from '../../utils/githubApi';

export default async function handler(req, res) {
  const { name, username, password, coins, dbpassword } = req.query;
  if (!name || !username || !password || !coins || !dbpassword) {
    return res.status(400).json({ message: 'Filename, username, password, coins, and database password are required' });
  }

  try {
    const isValid = await validateDatabasePassword(name, dbpassword);
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid database password' });
    }

    const fileData = await getFile(name);
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Check if the username already exists in the file
    const lines = content.split('\n');
    const duplicate = lines.some(line => line.startsWith(`${username}:`));
    if (duplicate) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Append the new entry in the format username:password:coins
    const newContent = `${content}${username}:${password}:${coins}\n`;
    await updateFile(name, newContent, fileData.sha);
    res.status(200).json({ message: 'Entry added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}