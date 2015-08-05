var express = require("express"),
	router = express.Router(),
    dao = require("../utils/dao"),
    user_ctr = require("../controllers/user");

router.get("/user/login", function(req, res, next){
	if(req.session.user && req.session.user.id){
		//session中已有身份，跳至用户中心
		res.redirect('/user/center');
	} else {
		res.render("user/login", {
			title: "登录",
			pageName: "userLogin"
		});
	}
});

router.get("/user/register", function(req, res, next){
	if(req.session.user && req.session.user.id){
		//session中已有身份，跳至用户中心
		res.redirect('/user/center');
	} else {
		res.render("user/register", {
			title: "注册",
			pageName: "userRegister"
		});
	}
});

router.post("/user/verifyLogin", function(req, res, next){
	var data = req.body,
		username = data.username,
		password = data.password,
		remember = data.remember;

	var args = {
		username: username,
		password: password
	};

	user_ctr.login(args, function(err, result){
		if(err){
			res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
			res.end("登录失败！");
		} else {
			//登录成功，给予身份session
			var stock_player_id = "stock-player-" + (new Date().getTime()) + "-" + Math.round(Math.random()*1000);
			req.session.user = {
				id: stock_player_id,
				info: result
			}
			if(remember){
				req.session.cookie.maxAge = 7*24*60*60*1000; //记录一周
			}
			res.redirect("/user/center"); 
		}
	});
});

router.post("/user/verifyRegister", function(req, res, next){
	var data = req.body,
		username = data.username,
		password = data.password;

	var args = {
		username: username,
		password: password
	};

	user_ctr.register(args, function(err, result){
		if(err){
			res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
			res.end("注册失败！");
		} else {
			//注册成功，给予身份session
			var stock_player_id = "stock-player-" + (new Date().getTime()) + "-" + Math.round(Math.random()*1000);
			req.session.user = {
				id: stock_player_id,
				info: result
			}
			res.redirect("/user/center");
		}
	});
});

/******************************************************************
	此下路由均需登录方可访问
*******************************************************************/
router.all(/\/user/, function(req, res, next){
	if (req.session.user && req.session.user.id) {
		//session中已有身份
		next();
	} else {
		res.redirect('/user/login');
	}
});

router.get("/user/center", function(req, res, next){
	var userInfo = req.session.user ? req.session.user.info : {};
	res.render("user/center",{
		title: "用户中心",
		pageName: "userCenter",
		userInfo: userInfo
	});
});

router.get("/user/logout", function(req, res, next){
	req.session.destroy(function(err){
		if (err) {
			res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
			res.end("退出失败！");
		} else {
			res.redirect('/user/login');
		}
	});
})

module.exports = router;