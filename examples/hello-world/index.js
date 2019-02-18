var { Minko } = require("../../build"); // use 'require("minko")' instead.

var minko = new Minko();

minko.addComponentFromFile("hello-world", __dirname + "/components/hello-world.mko");

minko.renderToString("hello-world")
    .then(html => console.log(html))
    .catch(err => console.error(err));
