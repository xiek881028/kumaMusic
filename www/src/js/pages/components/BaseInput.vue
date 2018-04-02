/*!
* BaseInput
* create: 2018-03-24
* since: 0.0.1
*/

<template lang="pug">
	.inputBox
		input(:value='searchKey' @input="onInput" ref="input")
		.delBox(:class='{hidden: isHidden}')
			i.del.fa.fa-close(@click="onDel" ref="del")
</template>

<script>
module.exports = {
	data() {
		return {
			isHidden: true,
		};
	},
	props: [
		'searchKey',
	],
	methods: {
		onInput: function(){
			this.$emit('input', this.$refs.input.value);
			this.showDel();
		},
		onDel: function(){
			this.$refs.input.value = '';
			this.$emit('input', this.$refs.input.value);
			this.showDel();
		},
		showDel: function(){
			this.isHidden = !this.$refs.input.value.length;
		},
	},
	mounted() {
		this.$refs.input.style.fontSize = `${this.$refs.input.clientHeight * .6}px`;
		this.$refs.del.style.fontSize = `${this.$refs.input.clientHeight * .45}px`;
		this.showDel();
	},
}
</script>

<style lang="scss" scoped>
.inputBox{
	background-color: #fff;
	position: relative;
	input{
		padding: 0 3rem 0 1rem;
		margin: 0;
		border: none;
		width: 100%;
		height: 100%;
		display: block;
		box-sizing: border-box;
	}
	.delBox{
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 3rem;
		display: flex;
		justify-content: center;
		align-items: center;
		.del{
			padding: .3rem;
		}
	}
}
</style>
