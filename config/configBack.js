require("dotenv").config();

const config = {
    DB_USER : process.env.db_user,
    DB_PASSWORD : process.env.db_password,
    PORT : process.env.PORT || 3000,
    DOMAIN : process.env.domain,
    AUDIENCE : process.env.audience
}

module.exports = config;