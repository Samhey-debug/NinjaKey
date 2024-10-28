// /api/passwords/deleteDatabase.js
import { getFile, deleteFile, updateFile, validateDatabasePassword } from '../../utils/githubApi';

export default async function handler(req, res) {
  const { name, dbpassword } = req.query;
  if (!name || !dbpassword) {
    return res.status(400).json({ message: 'Filename and database password are required' });
  }

  try {
    // Validate the database password before proceeding
    const isValid = await validateDatabasePassword(name, dbpassword);
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid database password' });
    }

    // Fetch the passwords file to remove the entry for this database
    const passwordsFile = await getFile('passwords');
    const content = Buffer.from(passwordsFile.content, 'base64').toString('utf-8');
    const newContent = content
      .split('\n')
      .filter(line => !line.startsWith(`${name}:`)) // Remove the line with the database entry
      .join('\n');

    // Update the passwords file without the deleted database entry
    await updateFile('passwords', newContent, passwordsFile.sha);

    // Delete the actual database file
    const dbFile = await getFile(name);
    await deleteFile(name, dbFile.sha);

    res.status(200).json({ message: 'Database deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}