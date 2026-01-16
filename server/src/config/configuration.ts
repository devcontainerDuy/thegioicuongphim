export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    name:
      process.env.DATABASE_NAME ||
      process.env.DB_DATABASE ||
      'thegioicuongphim',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
