<template>
		<vir-list v-slot="{data,index}">
			<item :data="data" :index="index"></item>
		</vir-list>
</template>

<script>
	import {
		fetchData
	} from '../../helper.js';
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
</style>
