const routes = (handler) => [
 {
    method: 'POST',
    path: '/songs',
    handler: handler
 }
]

module.exports = routes;