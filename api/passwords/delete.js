// /api/passwords/delete.js
import { getFile, updateFile, validateDatabasePassword } from '../../utils/githubApi';

export default async function handler(req, res) {
  const { name, username, dbpassword } = req.query;
  if (!name || !username || !dbpassword) {
    return res.status(400).json({ message: 'Filename, username, and database password are required' });
  }

  try {
    const isValid = await validateDatabasePassword(name, dbpassword);
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid database password' });
    }

    const fileData = await getFile(name);
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const newContent = content.split('\n').filter(line => !line.startsWith(`${username}:`)).join('\n');
    await updateFile(name, newContent, fileData.sha);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}