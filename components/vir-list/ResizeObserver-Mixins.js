import ResizeObserver from 'resize-observer-polyfill';
const ResizeObserverMixins ={
	mounted() {
		console.log('挂载混入');
		const ro = new ResizeObserver((entries, observer) => {
			// 高度发生变化时，将 'size-change' 事件 emit 到父组件
			this.$emit('size-change', this.index);
		});
		ro.observe(this.$refs.item.$el);
		this.$once('hook:beforeDestroy', ro.disconnect.bind(ro));
	}
}

export default ResizeObserverMixins;