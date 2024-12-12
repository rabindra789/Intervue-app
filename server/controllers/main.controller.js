// homepage

exports.homepage = async (req, res) => {
    const locals = {
        title: "Intervue App",
        description: "Open source Intervue app"
    }

    res.render("index", {locals, layout: "../views/layouts/main"})
}


exports.about = async (req, res) => {
    const locals = {
        title: "About - Notes App",
        description: "Open source notes app"
    }

    res.render("about", locals)
}
