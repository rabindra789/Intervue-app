const User = require("../models/user.model.js");
exports.dashboard = async (req, res) => {
    const googleId = req.params.googleId;
    const { profileImage } = await User.findOne({ googleId: googleId });
    const locals = {
        profileImage: profileImage,
        googleId: googleId,
        title: "Intervue App",
        description: "Open source Intervue app",
    };

    res.render("dashboard", { locals, layout: "../views/layouts/dashboard" });
};
