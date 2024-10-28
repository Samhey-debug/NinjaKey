// /api/passwords/get.js
import { getFile, validateDatabasePassword } from '../../utils/githubApi';

export default async function handler(req, res) {
  const { name, dbpassword } = req.query;
  if (!name || !dbpassword) return res.status(400).json({ message: 'Filename and database password are required' });

  try {
    const isValid = await validateDatabasePassword(name, dbpassword);
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid database password' });
    }

    const fileData = await getFile(name);
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    res.status(200).json({ data: content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}