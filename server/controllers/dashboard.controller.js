const User = require("../models/user.model.js");
exports.dashboard = async (req, res) => {
    try {
        const googleId = req.params.googleId;
        const user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("dashboard", {
            userRooms: user.rooms,
            profileImage: user.profileImage,
            googleId: user.googleId,
            title: "Intervue App",
            description: "Open source Intervue app",
            layout: "../views/layouts/dashboard",
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        res.status(500).send("Error fetching dashboard");
    }
};
