function ustanToStan(value) {
    return (value / 1000000)
}
function stanToUstan(value) {
    return (value * 1000000)
}

// function toFiatValue(value, currency = 'usd') {
//     // @TODO get coin value from api
//     return value * api_value
// }

module.exports = {
    ustanToStan: function (value) {
        return ustanToStan(value)
    },
    stanToUstan: function (value) {
        return stanToUstan(value)
    }
}