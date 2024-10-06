import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import googleRoutes from './routes/googleRoutes';
import corsOptions from './config/cors/options';

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth/google', googleRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
