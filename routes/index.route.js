const express = require("express")
const router = express.Router()
const http = require("http")
const index_controller = require("../controllers/index.controller")

router.get("/", index_controller.homepage)

router.get("/signin", index_controller.signinpage)

router.get("/signup", index_controller.signuppage)

router.post("/", function (req, res) {
  // Stringify JSON data
  const data = JSON.stringify(req.body)

  // Create options
  const options = {
    hostname: req.hostname,
    port: 3000,
    path: "/users/signin",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  }

  // Make http request
  const httpReq = http.request(options, httpRes => {
    console.log(`statusCode: ${httpRes.statusCode}`)

    var buff = ""
    httpRes.on("data", chunks => {
      buff += chunks
    })

    httpRes.on("end", () => {
      if (httpRes.statusCode === 200) {
        console.log(httpRes.headers["authorization"])
        res.cookie("authorization", httpRes.headers["authorization"])
        res.render("dashboard", JSON.parse(buff))
      } else res.render("index", JSON.parse(buff))
    })
  })

  httpReq.on("error", error => {
    console.error(error)
  })

  httpReq.write(data)
  httpReq.end()
})

module.exports = router
