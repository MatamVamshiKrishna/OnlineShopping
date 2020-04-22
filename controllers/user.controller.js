// status code ref : https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

const User = require("../models/user.model")
const Order = require("../models/order.model")
const Token = require("../models/token.model")
const PasswordHash = require("password-hash")
const nodemailer = require("nodemailer")
const credentials = require("../credentials.json")

const bcrypt = require('bcrypt')
const saltRounds = 10

// create random id
var randomId = "53gdhdkdyiskdwkhkd"


//sendemail()

async function sendemail() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  /*let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  })*/

  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
      user: credentials.email, // generated ethereal user
      pass: credentials.password // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  })


  // send mail with defined transport object
  let info = await transporter.sendMail({
    //from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "vamshi.krishna@live.in", // list of receivers
    subject: "Email verification ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b><h1>Verify your email</h1><p>link:localhost:3000/verify/randomId" // html body
  })

  console.log("Message sent: %s", info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.signup = async (req, res) => {
  //await sendemail()

  // First check if account exists with this email id
  let user = await User.findOne({ email: req.body.email })
  if (user) {
    // 409 : Conflict
    return res.status(409).send({ message: "User already exists" })
  }

  // Create a new user with the data client has sent
  // Make sure to hash the password
  user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, saltRounds),
    name: req.body.name
  })

  console.log(user._id)

  // save user in database
  user = await user.save()

  console.log(user._id)

  // create new token
  var token = new Token({ userId: user._id })

  // save token in database
  token = await token.save()

  res.header("authorization", token._id)
  res.status(200).send({ message: "Account created successfully" })
}

exports.signin = async (req, res) => {
  // First check if account exists with this email id
  var user = await User.findOne({ email: req.body.email })
  if (!user) {
    // 404 Not Found
    return res.status(404).send({ message: "Account does not exists" })
  }

  // verify password
  if (!PasswordHash.verify(req.body.password, user.password)) {
    // 403 : Forbidden
    return res.status(403).send({ message: "Invalid password" })
  }

  // create new token
  var token = new Token({ userId: user._id })

  // save token in database
  token = await token.save()

  res.header("authorization", token._id)
  res.status(200).send(user)
}

exports.signout = async (req, res) => {
  // Remove token from database
  var token = await Token.findByIdAndDelete(req.token._id)
  console.log(token)
  res.status(200).send({ message: "Signout success" })
}

exports.signoutall = async (req, res) => {
  // Remove all tokens associated with the userId
  var tokens = await Token.deleteMany({ userId: req.token.userId })
  console.log(tokens)
  res.status(200).send({ message: "Signout all success" })
}

exports.retrieveuser = async (req, res) => {
  // Send user associated with userId
  var user = await User.findById(req.token.userId).populate("orders")
  if (!user) {
    res.status(404).send({ message: "User not found" })
  }
  res.status(200).send(user)
}

exports.createOrder = async (req, res) => {
  var order = new Order({
    product: req.body.productId,
    price: req.body.price,
    purchaseDate: new Date()
  })

  order = await order.save()

  await User.findByIdAndUpdate(req.token.userId, { "$push": { "orders": order._id } }, { "new": true, "upsert": true })
  res.status(200).send({ message: "Product purchased" })
}

exports.retrieveOrders = async (req, res) => {
  // TODO
}
