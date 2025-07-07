import jwt from 'jsonwebtoken';

const validateJWT = (req,res,next) => {
  const token = req.header('Authorization').replace('Bearer' , '');
  if(!token){
    return res.status(401).json({
      message: 'No token, authorization denied'
    })
  }
  try{
    const user = jwt.verify(token,process.env.JWT_SECRET);
    req.user = user;
    next
  }
  catch(err){
    console.log(err)
    return res.status(500).json(
      {message: 'Internal server error'}
    )
  }
}

export default validateJWT
