// /api/passwords/create.js
import { createFile, getFile, updateFile } from '../../utils/githubApi';

export default async function handler(req, res) {
  const { name, dbpassword } = req.query;
  if (!name || !dbpassword) return res.status(400).json({ message: 'Filename and database password are required' });

  try {
    // Check if database entry already exists in passwords.txt
    const passwordsFile = await getFile('passwords');
    const content = Buffer.from(passwordsFile.content, 'base64').toString('utf-8');
    const dbExists = content.split('\n').some(line => line.startsWith(`${name}:`));

    if (dbExists) {
      return res.status(409).json({ message: 'Database already exists' });
    }

    // Add new dbname:dbpassword entry to passwords.txt
    const newContent = `${content}${name}:${dbpassword}\n`;
    await updateFile('passwords', newContent, passwordsFile.sha);

    // Create the new database file
    await createFile(name);
    res.status(201).json({ message: 'Database created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}