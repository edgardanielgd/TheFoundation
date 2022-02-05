const joi = require( "joi" );

const moviesSchema = joi.object({
    id: joi.number(),
    budget: joi.number().required(),
    poster_path: joi.string().required(),
    overview: joi.string().required(),
    runtime: joi.number().required(),
    belongs_to_collection: joi.array(),
    genres: joi.array().min(1).required(),
    homepage: joi.string().empty(""),
    original_title: joi.string().required(),
    popularity: joi.number(),
    production_companies: joi.array(),
    release_date: joi.string(),
    status: joi.string(),
    tagline: joi.string(),
    title: joi.string().required(),
    Keywords: joi.array(),
    cast: joi.array(),
    crew: joi.array()
});
module.exports = {
    moviesSchema
}