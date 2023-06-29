const userModel = require('../models/user');
const orderModel = require('../models/order');
const bcrypt = require('bcrypt');
const easyinvoice = require('easyinvoice');


// encription
const pwdEncription = (password) => {
    const hashedPWD = bcrypt.hash(password, 10)
    return hashedPWD
}

const profile = async (req, res) => {
    try {
        const userDetails = await userModel.findOne({ email: req.session.email });
        let cart = userDetails.cart.items;
        let cartCount = cart.length;
        const user = req.session.user;
        const FoundUser = req.session.email;
        const userData = await userModel.findOne({ email: FoundUser });
        res.render('user/account/profile', { title: "Profile", user, userData, cartCount });
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
        let cart = userData.cart.items;
        let cartCount = cart.length;
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
            res.render('user/account/profile', { title: "Profile", user, userData, success: "Successfully Updated", cartCount });
        } else {
            res.render('user/account/profile', { title: "Profile", user, userData, error: "Please check Your Current Password & Updated Email ID", cartCount });
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
        let cart = userData.cart.items;
        let cartCount = cart.length;
        const userAddress = userData.address;
        res.render('user/account/address', { user, title: "Address", userAddress, cartCount })
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
        const cart = userData.cart.items;
        const cartCount = cart.length;
        const address = userDetails.address;
        const selectedAddress = address.find((data) => data._id.toString() === addressId);
        res.render('user/account/editAddress', { user, title: "Edit Address", selectedAddress, cartCount })
    } catch (error) {
        console.log(error)
    }
}

// My Order
const order = async (req, res) => {
    try {
        const user = req.session.user;
        const email = req.session.email;
        const userDetails = await userModel.findOne({ email: email });
        const cart = userDetails.cart.items;
        const cartCount = cart.length;
        const userid = userDetails._id;
        const order = await orderModel.find({ userId: userid, orderCancleRequest: false, status: { $ne: 'Deliverd' } }).sort({ _id: -1 });
        const orderHist = await orderModel.find({
            userId: userid,
            $or: [
                { orderCancleRequest: true },
                { status: 'Deliverd' }
            ],orderReturnRequest:false
        }).sort({ _id: -1 });
        const orderProducts = orderHist.map(data => data.products);
        const orderProduct = orderProducts.flat();
        const orderHistStatus = orderHist.map(data => data.orderCancleRequest);
        const orderHista = orderHist.map(data => data.status);


        const product = order.map(data => data.products);
        const newProduct = product.flat();
        const status = order.map(data => data.status);
        const orderstatus = order.map(data => data.orderCancleRequest);
        const Date = order.map(data => data.expectedDelivery.toLocaleDateString());
        console.log(orderHist);
        res.render('user/account/myOrder', {
            title: "OrderPage",
            user,
            newProduct,
            status,
            Date,
            order,
            orderstatus,
            cartCount,
            orderHist,
            orderProduct,
            orderHistStatus,
            orderHista,
        });
    } catch (error) {
        console.log(error)
    }
}
const orderView = async (req, res) => {
    try {
        const user = req.session.user;
        const userDetails = await userModel.findOne({ email: req.session.email });
        const cart = userDetails.cart.items;
        const cartCount = cart.length;
        const orderId = req.query.id;
        const order = await orderModel.find({ _id: orderId });;
        const orderProducts = order.map(items => items.proCartDetail).flat();
        const cartProducts = order.map(items => items.cartProduct).flat();
        for (let i = 0; i < orderProducts.length; i++) {
            const orderProductId = orderProducts[i]._id;
            const matchingCartProduct = cartProducts.find(cartProduct => cartProduct.productId.toString() === orderProductId.toString());

            if (matchingCartProduct) {
                orderProducts[i].cartProduct = matchingCartProduct;
            }
        }
        const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
        const subTotal = cartProducts.reduce((totals, items) => totals + items.realPrice, 0);
        const [orderCanceld] = order.map(item => item.orderCancleRequest);
        const orderStatus = order.map(item => item.status);
        res.render("user/account/orderStatus", { title: "Product view", user, cartCount, order, orderProducts, subTotal, address, orderCanceld, orderStatus })
    } catch (error) {
        console.log(error)
    }
};
const orderStatus = async (req, res) => {
    try {
        const user = req.session.user;
        const userDetails = await userModel.findOne({ email: req.session.email });
        const cart = userDetails.cart.items;
        const cartCount = cart.length;
        const orderId = req.params.id;
        const order = await orderModel.find({ _id: orderId });
        const orderProducts = order.map(items => items.proCartDetail).flat();
        const cartProducts = order.map(items => items.cartProduct).flat();
        for (let i = 0; i < orderProducts.length; i++) {
            const orderProductId = orderProducts[i]._id;
            const matchingCartProduct = cartProducts.find(cartProduct => cartProduct.productId.toString() === orderProductId.toString());

            if (matchingCartProduct) {
                orderProducts[i].cartProduct = matchingCartProduct;
            }
        }
        const address = userDetails.address.find(items => items._id.toString() == order.map(items => items.address).toString());
        const subTotal = cartProducts.reduce((totals, items) => totals + items.realPrice, 0);
        const [orderCanceld] = order.map(item => item.orderCancleRequest);
        const orderStatus = order.map(item => item.status);
        res.render("user/account/orderStatus", { title: "Product view", user, cartCount, order, orderProducts, subTotal, address, orderCanceld, orderStatus })
    } catch (error) {
        console.log(error)
    }
}
const pdf = async (req, res) => {
    try {
        const da = req.body
        console.log(da)
        // Extract the necessary data from your request or database
        const data = {
            order: {
                _id: '123456',
                status: 'Pending',
                payment: {
                    method: 'Credit Card',
                    amount: 100,
                },
            },
            address: {
                name: 'John Doe',
                houseName: '123 Main St',
                street: 'City',
                city: 'State',
                state: 'Country',
                postalCode: '12345',
                phone: '123-456-7890',
            },
            orderProduct: [
                { p_name: 'Product 1', realPrice: 50 },
                { p_name: 'Product 2', realPrice: 25 },
                { p_name: 'Product 3', realPrice: 30 },
            ],
            discount: 10,
        };

        // Create the invoice options using the data
        const invoiceOptions = {
            documentTitle: 'Invoice',
            currency: 'USD',
            taxNotation: 'GST',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            logo: 'https://example.com/logo.png', // Replace with your logo URL
            sender: {
                company: 'Asthra Fashion World',
                address: 'Neyyattinkara, gramam, Thiruvananthapuram, PIN 695121',
                email: 'info@example.com',
                phone: '+1 123-456-7890',
            },
            client: {
                company: 'Client Company',
                address: `${data.address.name}, ${data.address.houseName}, ${data.address.street}, ${data.address.city}, ${data.address.state}, PIN: ${data.address.postalCode}`,
                email: 'client@example.com',
                phone: data.address.phone,
            },
            invoiceNumber: `#${data.order._id}`,
            invoiceDate: new Date().toDateString(),
            products: data.orderProduct.map((product) => ({
                description: product.p_name,
                quantity: 1,
                price: product.realPrice,
            })),
            bottomNotice: `Discount: $${data.discount}`,
            // Calculate the subtotal and total amounts based on your data
            subtotal: 105,
            total: 95,
        };

        // Generate the invoice as a PDF buffer
        const invoiceBuffer = await easyinvoice.createInvoice(invoiceOptions);

        // Set response headers for downloading the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

        // Send the invoice PDF buffer as the response
        res.send(invoiceBuffer);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};
const orderReturn = async (req,res) => {
    try {
      const id = req.params.id;
      await orderModel.findByIdAndUpdate({ _id: id },
        {
            $set: {
                orderReturnRequest: true
            }
        });

    res.redirect('/profile/order');
    } catch (error) {
        console.log(error)
    }
}
const orderCancel = async (req, res) => {
    try {
        const id = req.params.id;
        await orderModel.findByIdAndUpdate({ _id: id },
            {
                $set: {
                    orderCancleRequest: true
                }
            });

        res.redirect('/profile/order');
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
    order,
    orderCancel,
    orderView,
    pdf,
    orderStatus,
    orderReturn
};