const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
	await ctx.render("pages/client/index");
});

module.exports = router;
