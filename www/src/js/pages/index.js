const BaseHome = resolve => require(['./BaseHome.vue'], resolve);
const BaseList = resolve => require(['./BaseList.vue'], resolve);
const BaseNotFound = resolve => require(['./BaseNotFound.vue'], resolve);
const BaseDetails = resolve => require(['./BaseDetails.vue'], resolve);

const Title = 'KUMA音乐';

const routes = [
	{name: 'home', path: '/', component: BaseHome, meta: {title: `首页 - ${Title}`}},
	{name: 'list', path: '/list', component: BaseList, meta: {title: `搜索结果 - ${Title}`}},
	{name: 'details', path: '/details/:platform/:id', component: BaseDetails, meta: {title: `详情 - ${Title}`}},
	{name: '404', path: '*', component: BaseNotFound, meta: {title: `404 - ${Title}`}},
];

const router = new VueRouter({
	routes,
});

router.beforeEach((to, from, next) => {
	//单页应用重置title(据说IOS的微信有bug，选择性无视)
	if(to.meta.title){
		document.title = to.meta.title;
	}
	next();
});

export default router;
