// config/config.js (例)
require('dotenv').config(); // 開発用に.envファイルを使う場合

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'db/development.sqlite3'
  },
  test: {
    dialect: 'sqlite',
    storage: 'db/test.sqlite3'
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // デプロイ先によっては必要
      }
    }
  }
};
