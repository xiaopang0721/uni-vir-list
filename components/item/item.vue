<template>
	<view class="item" ref="item">
		<view class="item__wrapper" :class="{ 'is-fixed': fixedHeight }">
			<view class="item__info">
				<image mode="widthFix" :src="data.avatar" class="item__avatar" />
				<view class="item__name">{{ index }}. {{ data.name }}</view>
				<view class="item__date">{{ data.dob }}</view>
			</view>
			<view v-if="fixedHeight">
				<view class="item__text">E-mail: {{ data.email }}</view>
				<view class="item__text">Phone: {{ data.phone }}</view>
				<view class="item__text">City: {{ data.address.city }}</view>
				<view class="item__text">Street: {{ data.address.street }}</view>
			</view>
			<view v-else>
				<view class="item__paragraph">{{ data.paragraph }}</view>
				<image mode="widthFix" :src="defferImgSrc" :style="{ width: data.img.width }" class="item__img" />
				<image mode="widthFix" :src="data.img.src" :style="{ width: data.img.width }" class="item__img" />
			</view>
		</view>
	</view>
</template>

<script>
	/* eslint-disable no-console */
	import ResizeObserver from 'resize-observer-polyfill';
	import faker from 'faker';

	export default {
		name: 'item',
		props: {
			index: {
				type: Number,
				default: 0,
			},
			data: {
				type: Object,
				default: () => ({}),
			},
			fixedHeight: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				defferImgSrc: '',
			};
		},
		created() {
			// 模拟图片加载时间
			if (this.data.img.isDeffer) {
				this.defferImgSrc = this.data.img.src;
			} else {
				setTimeout(() => {
					this.defferImgSrc = this.data.img.src;
					this.data.img.isDeffer = true;
				}, faker.random.number({
					min: 300,
					max: 5000
				}));
			}
		},
		mounted() {
			if (this.fixedHeight) return;

			const ro = new ResizeObserver((entries, observer) => {
				// 高度发生变化时，将 'size-change' 事件 emit 到父组件
				this.$emit('size-change', this.index);
			});
			ro.observe(this.$refs.item.$el);
			this.$once('hook:beforeDestroy', ro.disconnect.bind(ro));
		},
	};
</script>

<style scoped lang="scss">
	.item {
		// padding: 11px 20px;
		width: 100%;

		&.is-fixed {

			&__name,
			&__date,
			&__text,
			&__paragraph {
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		}

		&__wrapper {
			padding: 20px;
			padding-top: 0;
			background-color: #fff;
			border: 1px solid #eaeaea;
			border-radius: 5px;
		}

		&__info {
			padding: 20px 0 20px 60px;
			position: relative;
		}

		&__avatar {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			margin: auto 0;
			width: 50px;
			height: 50px;
			background-color: #eaeaea;
			border-radius: 100%;
			overflow: hidden;
		}

		&__name,
		&__date,
		&__text,
		&__paragraph {
			margin-bottom: 4px;
			max-width: 100%;
			font-weight: bold;
			font-size: 12px;
		}

		&__text,
		&__paragraph {
			font-weight: normal;
		}

		&__img {
			margin-top: 10px;
			max-width: 100% !important;
			border-radius: 5px;
		}
	}
</style>
