const asyncHandler = require("express-async-handler");
const User = require("../models/uerModel");
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");

//@desc Register user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const userAvailable = await User.findOne({ email });
  if (!userAvailable) {
    res.status(400);
    throw new Error("User already register")
  }
  //Hash password
  const hashPassword = await bcryptjs.hash(password, 10);
  const user = User.create({
    username,
    email,
    password: hashPassword
  });
  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email })
  } else {
    throw new Error("User data is not valid");
  }
  res.json({ message: "Register the user" });
});

//@desc login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const user = await User.findOne({ email });
  //compare password with hash password
  if (user && (await bcryptjs.compare(password, user.password))) {
    const accessToken = jwt.sign({
      user: {
        username: user.username,
        email: user.email,
        id: user.id,
      }
    },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );
    res.status(200).json({ accessToken })
  } else {
    res.status(401);
    throw new Error("Email or password is not valid");
  }
});

//@desc current user
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
  res.json({ message: "Current user information" });
});

module.exports = {
  registerUser,
  loginUser,
  currentUser
}