import mysql from 'mysql';

import { credential } from './config';

//Initialize connection to MySQL
export const connection = mysql.createPool(credential);
