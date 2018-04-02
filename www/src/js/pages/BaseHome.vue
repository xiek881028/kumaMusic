/*!
* Home
* create: 2017-12-05
* since: 0.0.1
*/

<template lang="pug">
	div(is="BaseLayout")
		.indexBox
			transition(
				leave-active-class="bounceOut animated"
				@after-leave="delLine"
			)
				.contentBox(v-if="isShow")
					h3 KUMA音乐
					form.searchBox(@submit.prevent="toSubmit" ref="searchFrom")
						.inputBox(is="BaseInput" :searchKey='searchKey' @input="search")
						button.button.button-primary(type="submit") 搜索
			canvas(id="evanyou-canvas")
			.webInfo
				a(href="https://github.com/xiek881028" target="_blank")
					i.fa.fa-github
					| xiek881028
		div(is="BaseTips" :show="tipsShow" time="3000" @cb="tipsCallback" @afterLeave="tipsAfterLeave") {{tipsText}}
</template>

<script>
import BaseLayout from './components/BaseLayout.vue';
import BaseInput from './components/BaseInput.vue';
import BaseTips from './components/BaseTips.vue';
import Evanyou from '../../assets/evanyou.js';
export default {
	mounted () {
	},
	components: {
		BaseLayout,
		BaseInput,
		BaseTips,
		Evanyou,
	},
	data() {
		return {
			isShow: true,
			searchKey: '',
			tipsText: '',
			tipsShow: false,
		}
	},
	methods: {
		delLine() {
			this.searchKey.length && this.$router.push({name: 'list', query: {
					key: this.searchKey,
					platform: 'wy',
				}
			});
		},
		search(val) {
			this.searchKey = val;
		},
		toSubmit() {
			if(/^[\s]*$/.test(this.searchKey)){
				this.tipsText = '搜索词不能为空';
				this.tipsShow = true;
				return;
			}
			this.isShow = false;
		},
		tipsCallback(cb) {
			this.tipsShow = false;
		},
		tipsAfterLeave() {
			this.tipsText = '';
		},
	},
	mounted() {
		Evanyou();
	},
}
</script>

<style lang="scss" scoped>
.indexBox{
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.contentBox{
		margin-top: -30%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		z-index: 2;
		h3{
			font-weight: normal;
			font-size: 2rem;
			text-align: center;
			margin-top: 1rem;
			margin-bottom: 2.8rem;
		}
		.searchBox{
			width: 80%;
			max-width: 36rem;
			display: flex;
			justify-content: center;
			align-items: center;
			.inputBox{
				flex: auto;
				height: 3.33rem;
				// input{
				// 	height: 3.33rem;
				// 	line-height: 3.33rem;
				// 	box-sizing: border-box;
				// 	margin: 0;
				// 	border: none;
				// 	display: block;
				// 	width: 100%;
				// 	font-size: 1.8rem;
				// 	padding: 0 .8rem;
				// 	// padding: 0 1.5rem;
				// 	// font-size: 2rem;
				// 	// box-sizing: border-box;
				// }
			}
			button{
				flex: none;
				padding: 0 1.8rem;
			}
		}
	}
	canvas{
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 1;
		pointer-events: none;
	}
	.webInfo{
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		line-height: 2rem;
		a{
			color: #333;
			padding: .3rem;
			i{
				font-size: 1.6rem;
				margin-right: .4rem;
				margin-top: -.1rem;
				vertical-align: middle;
			}
		}
	}
}
</style>
