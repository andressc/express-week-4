import { config } from 'dotenv';
import { startApp } from './startApp';

config();

const port = process.env.PORT || 3000;

startApp(port);
