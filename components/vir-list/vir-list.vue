<template>
	<view ref="scroller" scroll-y class="height-dynamic" @scroll="handleScroll">
		<!-- 负责撑开 ul 的高度 -->
		<view class="height-dynamic__scroll-runway" ref="scrollRunway" :style="`transform: translate(0, ${scrollRunwayEnd}px)`"></view>
		<item class="height-dynamic__item" v-for="item in visibleData" :key="item.index" :data="item" :index="item.index" ref="items" :style="`transform: translate(0, ${cachedScrollY[item.index] || item.index * ESTIMATED_HEIGHT}px)`"
		 @size-change="handleSizeChange"></item>
	</view>
</template>

<script>
	/* eslint-disable no-console */
	import VirMixin from './vir-mixins.js'
	// import {
	// 	http
	// } from '../../api/services/http.js'
	// const BUFFER_SIZE = 3;
	// const ESTIMATED_HEIGHT = 5;
	export default {
		mixins:[VirMixin],
	};
</script>

<style scoped lang="scss">
	@import 'vir.scss'
</style>
