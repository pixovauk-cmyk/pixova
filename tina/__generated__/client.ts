import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: 'ff65935c3adebb359b464496a56cc1d350040bb4', queries,  });
export default client;
  