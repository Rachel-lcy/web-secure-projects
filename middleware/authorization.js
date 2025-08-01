export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/auth/login');
}

const canAccessFile = (user, file) => {
  if(!user || !file) return false;
  if(user.role === 'admin') return true;
  if(user.department === file.department) return true;
  if(user.username === file.uploadedBy) return true;

  return false
}

export default canAccessFile