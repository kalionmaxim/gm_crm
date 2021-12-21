const config = require("./config/config");
const cluster = require("cluster");
const numProcesses = config.get("processesNum") || 2;
const net = require("net");

if (cluster.isMaster) {
	console.log("Master");

	// This stores our workers. We need to keep them to be able to reference
	// them based on source IP address. It"s also useful for auto-restart,
	// for example.
	const workers = [];

	// Helper function for spawning worker at index "i".
	const spawn = function (i) {
		workers[i] = cluster.fork();

		// Optional: Restart worker on exit
		workers[i].on("exit", function (worker, code, signal) {
			console.log("respawning worker", i);
			spawn(i);
		});
	};

	// Spawn workers.
	for (let i = 0; i < numProcesses; i++) {
		spawn(i);
	}

	if (config.get("enableScheduler") === "true") {
		require("./scheduler");
	}

	// Helper function for getting a worker index based on IP address.
	// This is a hot path so it should be really fast. The way it works
	// is by converting the IP address to a number by removing the dots,
	// then compressing it to the number of slots we have.
	//
	// Compared against "real" hashing (from the sticky-session code) and
	// "real" IP number conversion, this function is on par in terms of
	// worker index distribution only much faster.

	/*	function getWorker(ip, len) {
			let _ip = ip.split(/["."|":"]/),
				arr = [];

			for (let el in _ip) {
				if (_ip[el] === "") {
					arr.push(0);
				} else {
					arr.push(parseInt(_ip[el], 16));
				}
			}

			return Number(arr.join("")) % len;
		}*/

	// Create the outside facing server listening on our port.
	net.createServer({ pauseOnConnect: true }, function (connection) {
		// We received a connection and need to pass it to the appropriate
		// worker. Get the worker for this connection"s source IP and pass
		// it the connection.
		const worker = workers[Math.floor(Math.random() * numProcesses)];
		// var worker = workers[worker_index(connection.remoteAddress, num_processes)];
		worker.send("sticky-session:connection", connection);
	}).listen(config.get("port"));
} else {
	console.log("Slave");

	require("dotenv").config();

	const eLogger = require("./lib/logger").eLogger;

	const path = require("path");

	const Koa = require("koa");
	const app = new Koa();
	const range = require("koa-range");
	const serv = app.listen(0, "localhost");
	const cors = require("koa-cors");
	const convert = require("koa-convert");

	app.use(range);
	app.use(convert(cors({
		origin: "*"
	})));

	app.proxy = true;

	const session = require("koa-session-minimal");
	const MongoStore = require("koa-generic-session-mongo");

	app.keys = ["session-secret", "another-session-secret"];
	app.use(session({
		key: "nika:sess",
		cookie: ctx => ({
			maxAge: (ctx.session && ctx.session.remember) ? 365 * 24 * 60 * 60 * 1000 : 0
		}),
		store: new MongoStore({
			db: config.get("mongoose:dbName")
		})
	}));

	const sassMiddleware = function (options) {
		const mw = require("node-sass-middleware")(options);
		return convert(function * (next) {
			yield mw.bind(mw, this.req, this.res);
			yield next;
		});
	};

	app.use(sassMiddleware({
		src: path.join(__dirname, "/public/stylesheets/scss"),
		dest: path.join(__dirname, "/public/stylesheets/css"),
		debug: false,
		outputStyle: "compressed",
		force: false,
		prefix: "/stylesheets/css"
	}));

	// body parser
	const bodyParser = require("koa-bodyparser");
	app.use(bodyParser({
		formLimit: "524288000",
		jsonLimit: "524288000",
		textLimit: "524288000"
	}));

	const favicon = require("koa-favicon");
	app.use(favicon(path.join(__dirname, "public", "img", "favicon.ico")));

	const serve = require("koa-static");
	app.use(serve(path.join(__dirname, "public")));

	const views = require("koa-views");
	app.use(views(path.join(__dirname, "views"), { extension: "pug" }));

	//Morgan (for logging to console, while developing and debugging)
	const morgan = require("koa-morgan");
	app.use(morgan("dev", {
		skip: function (req, res) {
			//Не выводим инфу в консоль о картинках, шрифтах и т.п.
			const regex = /^\/?[\w\/?.&-=]+\/?((\bimages\b)|(\bimg\b)|(\bfonts\b)|(\bcss\b)|(\buploads\b)|(\bjs\b))\/[\w\/?.%&-=]+$/;
			if (regex.test(req.url)) {
				return true;
			}
		}
	}));

	//Helmet (a little bit of protection)
	const helmet = require("koa-helmet");
	app.use(helmet({
		frameguard: false //нужно для корректной работы метрик
	}));

	//Handling errors
	app.use(async (ctx, next) => {
		try {
			await next();
			const status = ctx.status || 404;
			if (status === 404) {
				ctx.throw(404);
			}
		} catch (err) {
			ctx.status = err.status || 500;
			if (ctx.status === 404) {
				//Your 404.jade
				await ctx.render("pages/error404");
			} else {
				eLogger.error(err);
				//other_error jade
				await ctx.render("pages/error500");
			}
		}
	});

	const passport = require("koa-passport");
	app.use(passport.initialize());
	app.use(passport.session());

	require("./lib/passport")(passport);

	const rootRouter = require(path.join(__dirname, "routers", "root"));
	// app.use(rootRouter.routes());
	// app.use(rootRouter.allowedMethods());
	rootRouter(app, passport);

	// Listen to messages sent from the master. Ignore everything else.
	process.on("message", function (message, connection) {
		if (message !== "sticky-session:connection") {
			return;
		}

		// Emulate a connection event on the server by emitting the
		// event with the connection the master sent us.
		serv.emit("connection", connection);

		connection.resume();
	});
}
