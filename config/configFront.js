require("dotenv").config();

const config = {
    CLIENT_ID : process.env.client_id,
    DOMAIN : process.env.domain
}

module.exports = config;