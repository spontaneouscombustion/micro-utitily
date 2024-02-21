import { Client } from 'node-appwrite';
import router from './router.js';

export default async ({ req, res, log, error }) => {

  const client = new Client()

  client.setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT)

  return router.handle(req, { res, log, error, client })
    .then(response => response)
    .catch(e => res.json({ error: e.message }, 500))
  
};
