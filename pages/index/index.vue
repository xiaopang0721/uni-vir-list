<template>
	<vir-list>
	</vir-list>
</template>

<script>
	import {
		fetchData
	} from '../../helper.js';
	import ResizeObserver from 'resize-observer-polyfill';
	export default {
		data() {
			return {
				title: 'Hello',
				resize: 0
			}
		},
		onLoad() {

		},
		methods: {
			handleSizeChange(index) {
				this.resize = index
			}
		},
		mounted() {

		},
		created() {}
	}
</script>

<style lang="scss" scoped>
</style>
