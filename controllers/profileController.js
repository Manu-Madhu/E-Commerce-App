

const profile =(req,res)=>{
      res.render('user/account/profile');
}

const profileAddress = (req,res)=>{
     res.render('user/account/adress')
}

module.exports ={
    profile,
    profileAddress
};