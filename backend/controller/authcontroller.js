const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

 // TODOS: implement jwt token  generation for authentication 
const generateToken = (id) => {
     return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: '30d'});   
};

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationOtp = async (user) => {
    const otp = createOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const message = `Welcome to ShopZone, ${user.name}!\n\nYour OTP for ShopZone registration is: ${otp}\n\nThis OTP expires in 10 minutes.`;
    try {
        await sendEmail(user.email, 'Verify your ShopZone account', message);
        console.log(`OTP email sent to ${user.email}`);
    } catch (error) {
        console.error(`OTP email failed for ${user.email}: ${error.message}`);
        console.log(`Development OTP for ${user.email}: ${otp}`);
        throw new Error('Could not send OTP email. Check EMAIL_USER and EMAIL_PASS in backend/.env. For Gmail, EMAIL_PASS must be a 16-character App Password.');
    }
};
//register a new user 
const registerUser = async (req,res) => {
    const { name, email, password } = req.body || {};
    try{
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json ({message : 'user already exists' });
        }
        // TODOS: hash the password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

       
        const newUser = await User.create({ name, email, password : hashedPassword});
        if(newUser){
            await sendVerificationOtp(newUser);
            res.status(201).json({
               message: 'Registration successful. Please verify the OTP sent to your email.',
               email: newUser.email
            });
        }
        else {
            res.status(400).json({ message :'Invalid user data '});
        }
        // await newUser.save();
        // res.status(201).json ({ message : 'user registered  successfully'});
    } catch (error){
        res.status(500).json ({message : error.message || 'server error' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body || {};

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verified) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }

        if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.verified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'server error' });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body || {};

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verified) {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        await sendVerificationOtp(user);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'server error' });
    }
};

//Login User
 const loginUser = async (req,res) => {
    const { email, password } = req.body || {};
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if(user && (await bcrypt.compare(password, user.password))) {
            if (!user.verified) {
                return res.status(403).json({ message: 'Please verify your email with OTP before login', needsVerification: true, email: user.email });
            }

            res.json({
                _id: user._id,
               name: user.name,
               email: user.email,
               role: user.role,
               token: generateToken(user._id) 
            });
        } else {
            res.status(400).json({ message :'Invalid email or password '});
        }
    } catch (error)
     {
        res.status(500).json({ message: 'server error '});
    }
 };

const getUsers = async (req,res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'server error '});
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    verifyOtp,
    resendOtp
};
