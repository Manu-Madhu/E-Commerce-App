const user = require('../models/user');
const userModel = require('../models/user');
const bcrypt = require('bcrypt');


// encription
const pwdEncription = (password) => {
    const hashedPWD = bcrypt.hash(password, 10)
    return hashedPWD
}

const profile = async (req, res) => {
    try {
        const user = req.session.user;
        const FoundUser = req.session.email;
        const userData = await userModel.findOne({ email: FoundUser });
        res.render('user/account/profile', { title: "Profile", user, userData });
    } catch (error) {
        console.log(error)
    }

}

// profile detils update
const profileUpdate = async (req, res) => {
    try {
        const user = req.session.user;
        const FoundUser = req.session.email;
        const userData = await userModel.findOne({ email: FoundUser });
        const { name, email, number, password, password1, password2 } = req.body;

        if (password1 !== password2) {
            res.render('user/account/profile', { title: "Profile", user, userData, error: "Check the password currectly" });
        }
        const isMatch = await bcrypt.compare(password, userData.password);
        if (isMatch) {
            const encryptedPwd = await pwdEncription(password1);
            userData.name = name,
                userData.email = email,
                userData.number = number,
                userData.password = encryptedPwd;
            await userData.save();
            req.session.email = userData.email
            res.render('user/account/profile', { title: "Profile", user, userData, success: "Successfully Updated" });
        } else {
            res.render('user/account/profile', { title: "Profile", user, userData, error: "Please check Your Current Password & Updated Email ID" });
        }
    } catch (error) {
        console.log(error)
    }
}

// Address
const profileAddress = async (req, res) => {
    try {
        const user = req.session.user;
        const userEmail = req.session.email;
        const userData = await userModel.findOne({ email: userEmail });
        const userAddress = userData.address;
        res.render('user/account/address', { user, title: "Address", userAddress })
    } catch (error) {
        console.log(error)
    }
}
const newAddress = async (req, res) => {
    try {
        const email = req.session.email;
        const { name, houseName, street, city, state, phone, postalCode, AddressId } = req.body;
        const userData = await userModel.findOne({ email: email });
        const exisitingAddress = userData.address.find((data) => data._id.toString() === req.body.AddressId);

        if (exisitingAddress) {
            exisitingAddress.name = name;
            exisitingAddress.houseName = houseName;
            exisitingAddress.street = street;
            exisitingAddress.city = city;
            exisitingAddress.state = state;
            exisitingAddress.phone = phone;
            exisitingAddress.postalCode = postalCode;

        } else {
            const newAddress = {
                name: name,
                houseName: houseName,
                street: street,
                city: city,
                state: state,
                phone: phone,
                postalCode: postalCode
            };
            userData.address.push(newAddress);
        }
        await userData.save();
        res.redirect('/profile/address');
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

// address edit part
const editAddress = async (req, res) => {
    try {
        const user = req.session.user;
        const addressId = req.body.selectedAddress;
        const userDetails = await userModel.findOne({ email: req.session.email });
        const address = userDetails.address;
        const selectedAddress = address.find((data) => data._id.toString() === addressId);
        res.render('user/account/editAddress', { user, title: "Edit Address", selectedAddress })
    } catch (error) {
        console.log(error)
    }
}
const editedAddressUpdation = async (req, res) => {
    try {
        res.redirect('/profile/address');
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    profile,
    profileAddress,
    profileUpdate,
    newAddress,
    editAddress,
    editedAddressUpdation
};