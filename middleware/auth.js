const jwt=require("jsonwebtoken");
function user(req,res,next){const h=req.headers.authorization||"";try{req.user=jwt.verify(h.replace("Bearer ",""),process.env.JWT_SECRET);next()}catch(e){res.status(401).json({message:"Login required"})}}
function admin(req,res,next){user(req,res,()=>req.user.role==="admin"?next():res.status(403).json({message:"Admin access required"}))}
module.exports={user,admin};