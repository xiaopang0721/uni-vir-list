const BUFFER_SIZE = 3;
const ESTIMATED_HEIGHT = 150;
import {
	http
} from '../../api/services/http.js'
const VirMixin = {
	data() {
		return {
			ESTIMATED_HEIGHT,
			anchorItem: {
				index: 0,
				offset: 0
			},
			listData: [],
			visibleData: [],
			topPlaceholders: 0,
			bottomPlaceholders: 0,
			firstAttachedItem: 0,
			lastAttachedItem: 0,
			lastScrollTop: 0,
			cachedScrollY: [],
			cachedHeight: [],
			revising: false,
		};
	},
	computed: {
		scrollRunwayEnd() {
			const maxScrollY = this.cachedHeight.reduce((sum, h) => (sum += h || ESTIMATED_HEIGHT), 0);
			const currentAverageH = maxScrollY / this.cachedHeight.length;
			if (isNaN(currentAverageH)) {
				return this.listData.length * ESTIMATED_HEIGHT;
			} else {
				return maxScrollY + (this.listData.length - this.cachedHeight.length) * currentAverageH;
			}
		},
		VISIBLE_COUNT() {
			return Math.ceil(this.scrollerRef.offsetHeight / ESTIMATED_HEIGHT);
		},
		scrollerRef(){
			return this.$refs.scroller.$el
		}
	},
	mounted() {
		this.lastAttachedItem = this.VISIBLE_COUNT + BUFFER_SIZE;
		this.upCallback();
		this.updateVisibleData();
	},
	methods: {
		handleSizeChange(index) {
			this.calItemScrollY();
		},
		handleScroll() {
			if (this.revising) return;

			const delta = this.scrollerRef.scrollTop - this.lastScrollTop;
			this.lastScrollTop = this.scrollerRef.scrollTop;

			this.updateAnchorItem(delta);
			this.updateVisibleData();
			this.handleLoadMore();
		},
		async updateAnchorItem(delta) {
			const lastIndex = this.anchorItem.index;
			const lastOffset = this.anchorItem.offset;
			delta += lastOffset;

			let index = lastIndex;
			if (delta >= 0) {
				while (index < this.listData.length && delta > (this.cachedHeight[index] || ESTIMATED_HEIGHT)) {
					if (!this.cachedHeight[index]) {
						this.$set(this.cachedHeight, index, ESTIMATED_HEIGHT);
					}
					delta -= this.cachedHeight[index];
					index++;
				}
				if (index >= this.listData.length) {
					this.anchorItem = {
						index: this.listData.length - 1,
						offset: 0
					};
				} else {
					this.anchorItem = {
						index,
						offset: delta
					};
				}
			} else {
				while (delta < 0) {
					if (!this.cachedHeight[index - 1]) {
						this.$set(this.cachedHeight, index - 1, ESTIMATED_HEIGHT);
					}
					delta += this.cachedHeight[index - 1];
					index--;
				}
				if (index < 0) {
					this.anchorItem = {
						index: 0,
						offset: 0
					};
				} else {
					this.anchorItem = {
						index,
						offset: delta
					};
				}
			}
			// 修正拖动过快导致的滚动到顶端滚动条不足的偏差
			if (this.cachedScrollY[this.firstAttachedItem] <= -1) {
				console.log('revising insufficient');
				this.revising = true;
				const actualScrollY = this.cachedHeight.slice(0, Math.max(0, this.anchorItem.index)).reduce((sum, h) => (sum += h),
					0);
				this.scrollerRef.scrollTop = actualScrollY + this.anchorItem.offset;
				this.lastScrollTop = this.scrollerRef.scrollTop;
				if (this.scrollerRef.scrollTop === 0) {
					this.anchorItem = {
						index: 0,
						offset: 0
					};
				}
				this.calItemScrollY();
				this.revising = false;
			}
		},
		// 计算每一个 item 的 translateY 的高度
		async calItemScrollY() {
			await this.$nextTick();
			// 修正 vue diff 算法导致 item 顺序不正确的问题
			this.$refs.items.sort((a, b) => a.index - b.index);

			const anchorDomIndex = this.$refs.items.findIndex(item => item.index === this.anchorItem.index);
			const anchorDom = this.$refs.items[anchorDomIndex];
			const anchorDomHeight = anchorDom.$el.getBoundingClientRect().height;

			this.$set(this.cachedScrollY, this.anchorItem.index, this.scrollerRef.scrollTop - this.anchorItem.offset);
			this.$set(this.cachedHeight, this.anchorItem.index, anchorDomHeight);

			// 计算 anchorItem 后面的 item scrollY
			for (let i = anchorDomIndex + 1; i < this.$refs.items.length; i++) {
				const item = this.$refs.items[i];
				const {
					height
				} = item.$el.getBoundingClientRect();
				this.$set(this.cachedHeight, item.index, height);
				const scrollY = this.cachedScrollY[item.index - 1] + this.cachedHeight[item.index - 1];
				this.$set(this.cachedScrollY, item.index, scrollY);
			}
			// 计算 anchorItem 前面的 item scrollY
			for (let i = anchorDomIndex - 1; i >= 0; i--) {
				const item = this.$refs.items[i];
				this.$set(this.cachedHeight, item.index, item.$el.getBoundingClientRect().height);
				const scrollY = this.cachedScrollY[item.index + 1] - this.cachedHeight[item.index];
				this.$set(this.cachedScrollY, item.index, scrollY);
			}
			// 修正拖动过快导致的滚动到顶端有空余的偏差
			if (this.cachedScrollY[0] > 0) {
				console.log('revising redundant');
				this.revising = true;
				const delta = this.cachedScrollY[0];
				const last = Math.min(this.lastAttachedItem, this.listData.length);
				for (let i = 0; i < last; i++) {
					this.$set(this.cachedScrollY, i, this.cachedScrollY[i] - delta);
				}
				const scrollTop = this.cachedScrollY[this.anchorItem.index - 1] ?
					this.cachedScrollY[this.anchorItem.index - 1] + this.anchorItem.offset :
					this.anchorItem.offset;
				this.$refs.scroller.scrollTop = scrollTop;
				this.lastScrollTop = this.scrollerRef.scrollTop;
				this.revising = false;
			}
		},
		updateVisibleData() {
			const start = (this.firstAttachedItem = Math.max(0, this.anchorItem.index - BUFFER_SIZE));
			this.lastAttachedItem = this.firstAttachedItem + this.VISIBLE_COUNT + BUFFER_SIZE * 2;
			const end = Math.min(this.lastAttachedItem, this.listData.length);

			this.visibleData = this.listData.slice(start, end);
		},
		async upCallback() {
			// 发起请求
			console.log('发起mixins异步请求');
			const data = await http();
			// 给每个 item 打上序号标记
			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				item.index = this.listData.length;
				this.listData.push(item);
			}
			this.updateVisibleData();
		},
		handleLoadMore() {
			const scrollEnd = this.scrollerRef.scrollTop + this.scrollerRef.offsetHeight + ESTIMATED_HEIGHT;
			(scrollEnd >= this.scrollRunwayEnd || this.anchorItem.index === this.listData.length - 1) && this.upCallback();
		},
	}
}

export default VirMixin;
