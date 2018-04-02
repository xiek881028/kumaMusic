/*!
* BaseTips
* create: 2018-03-26
* since: 0.0.1
*/

<template lang="pug">
	.tipsBox
		transition(
			appear
			enter-active-class="fadeInUp animated"
			leave-active-class="fadeOutDown animated"
			@after-enter="afterEnter"
			@after-leave="afterLeave"
			mode="out-in"
		)
			.tipsBg(v-show="show")
				slot
</template>

<script>
module.exports = {
	data() {
		return {
			timer: null,
		};
	},
	props: [
		'show',
		'time',
	],
	methods: {
		afterEnter() {
			clearTimeout(this.timer);
			this.timer = setTimeout(()=>{
				this.$emit('cb');
			}, this.time);
		},
		afterLeave(el) {
			this.$emit('afterLeave', el);
		},
	},
	mounted() {
	},
}
</script>

<style lang="scss" scoped>
.tipsBox{
	position: fixed;
	z-index: 9999;
	bottom: 3rem;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	pointer-events: none;
	.tipsBg{
		color: #fff;
		font-size: 1.2rem;
		padding: .8rem 1.2rem;
		border-radius: 99rem;
		overflow: hidden;
		max-width: 80%;
		word-break:break-all;
		background: rgba(53, 53, 53, .85);
	}
}
</style>
