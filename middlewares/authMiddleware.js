export const isAdminLoggedIn = (req, res, next) => {
  if (req.session && req.session.admin) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please log in first",
    });
  }
};
