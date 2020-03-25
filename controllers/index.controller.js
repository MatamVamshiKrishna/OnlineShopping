const http = require("http")

exports.homepage = function (req, res) {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    //console.log('Signed Cookies: ', req.signedCookies)

    // TODO @vamshi
    // If cookie exist, get user information
    // Use promises
    var data = {}
    // Create options
    const options = {
        hostname: req.hostname,
        port: 3000,
        path: "/products",
        method: "GET"
    }

    // Make http request
    const httpReq = http.request(options, httpRes => {
        var buff = ""
        httpRes.on("data", chunks => {
            buff += chunks
        })

        httpRes.on("end", () => {
            if (httpRes.statusCode === 200) {
                data.products = JSON.parse(buff)
            }
            res.render("index", data)
        })
    })

    httpReq.on("error", error => {
        res.render("error", error)
    })

    httpReq.end()
}

exports.signinpage = function (req, res) {
    res.render("signin")
}

exports.signuppage = function (req, res) {
    res.render("signup")
}

