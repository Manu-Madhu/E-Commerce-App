
const profile =(req,res)=>{
    const user = req.session.user
      res.render('user/account/profile',{user,title:"Profile"});
}

const profileAddress = (req,res)=>{
    const user = req.session.user
     res.render('user/account/address', {user,title:"Address"})
}



module.exports ={
    profile,
    profileAddress
};