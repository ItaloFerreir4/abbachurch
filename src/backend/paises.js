const countries = require("countries-list");

function listarNomePaises(){
    return Object.values(countries.countries).map(country => country.name);
}

module.exports = { listarNomePaises };