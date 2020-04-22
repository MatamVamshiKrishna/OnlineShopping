const express = require("express")
const router = express.Router()
const user_controller = require("../controllers/user.controller")
const auth = require("../middlewares/auth")

var multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        var filetype = ''
        if (file.mimetype === 'image/gif') {
            filetype = 'gif'
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png'
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg'
        }
        cb(null, 'image-' + Date.now() + '.' + filetype)
    }
})

var upload = multer({ storage: storage })

router.post("/signup", user_controller.signup)

router.post("/signin", user_controller.signin)

router.post("/signout", auth, user_controller.signout)

router.post("/signoutall", auth, user_controller.signoutall)

router.get("/", auth, user_controller.retrieveuser)

// Create new order
router.post("/orders", auth, user_controller.createOrder)

// Retrive all orders
router.get("/orders", auth, user_controller.retrieveOrders)

// Upload image
router.post("/image", upload.single('file'), user_controller.uploadImage)

module.exports = router
