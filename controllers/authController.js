const bodyParser = require("body-parser");
const app = require("express")();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { promisify } = require("util");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

const createSendToken = (user, res) => {
  const token = signToken(user._id);

  res.cookie("token", token, {
    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    token,
    user,
  });
};
const userSignup = async (req, res) => {
  try {
    const tempUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      photo: "/images/defaultProfile.jpg",
      following: [],
      bio: "Bio set by the server for better UI structure of this page",
    };
    const newUser = await User.create(tempUser);

    createSendToken(newUser, res);
  } catch (e) {
    res.status(500).send({
      status: "fail",
      message: e,
    });
  }
};

const userLogin = async (req, res, next) => {
  try {
    // 1) check if email and password exists
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        status: "fail",
        message: "email or password is missing",
      });
    }
    // 2) check if user exists and password is correct
    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(400).send({
        status: "fail",
        message: "email or password is incorrect",
      });
    }
    // 3) send token
    const token = signToken(user._id);

    // SETTING UP COOKIES
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (e) {
    res.status(500).send({
      status: "fail",
      message: e,
    });
  }
};

const protect = async (req, res, next) => {
  try {
    // 1) Get token from headers or check if it is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.redirect("/login");
    }
    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_PRIVATE_KEY
    );

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) throw "The user belonging to the token no longer exists.";
    // 4) Check if user changed the password after token was issued
    // if (freshUser.passwordChangedAfter(decoded.iat)) {
    //   throw "password changed login again.";
    // }

    // GRANTING USER ACCESS TO THE SECURE ROUTE
    req.user = freshUser;
    next();
  } catch (e) {
    res.redirect("/login");
  }
};

const loginCheck = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next();
    }
    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_PRIVATE_KEY
    );

    const freshUser = await User.findById(decoded.id);
    req.user = freshUser;
    next();
  } catch (e) {
    next();
  }
};

const restrictedTo = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(406).send({
        status: "fail",
        message: "unauthorised access",
      });
    }
    next();
  };
};
module.exports = { userSignup, userLogin, protect, restrictedTo, loginCheck };
