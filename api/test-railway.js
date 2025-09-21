// Script de diagnóstico para Railway
import dotenv from 'dotenv';
dotenv.config();

console.log('=== DIAGNÓSTICO RAILWAY ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Intentar conectar a MongoDB
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/opportunity-job';

console.log('Intentando conectar a MongoDB...');
console.log('URI:', mongoUri);

try {
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB conectado exitosamente');
  process.exit(0);
} catch (error) {
  console.error('❌ Error conectando a MongoDB:', error.message);
  process.exit(1);
}
