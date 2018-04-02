/*!
 * _common
 * create: 2017/11/30
 * since: 0.0.1
 */
'use strict';

// Css
import '../css/_common.scss';

import pages from './pages';
import BaseTransitionBox from './pages/components/BaseTransitionBox.vue';

new Vue({
	el:'#app',
	router: pages,
	components: {
		BaseTransitionBox
	},
	data: {
		Bus: new Vue(),
	},
});
