require("dotenv").config();

const config = {
    DB_USER : process.env.db_user,
    DB_PASSWORD : process.env.db_password,
    PORT : process.env.PORT || 3000
}

module.exports = config;