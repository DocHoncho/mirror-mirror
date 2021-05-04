<template>
	<v-container>
		<v-row>
			1. Copy image data into clipboard or press Print Screen <br>
			2. Press Ctrl+V (page/iframe must be focused):
		</v-row>
		<v-row>
			<v-col>
				<canvas style="border:1px solid grey;"
								id="srcImgCanvas"
								width="300"
								height="300"
								ref="srcImgCanvas"
				></canvas>
				<v-slider
						v-model="srcImgTranslate"
						thumb-label="always"
						:min="srcImgMin"
						:max="srcImgMax"
				/>
				<v-slider
						v-model="srcImgRotate"
						thumb-label="always"
						min="-360"
						max="360"
				/>
			</v-col>
			<v-col>
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<canvas style="border:1px solid grey;"
								id="destImgCanvas"
								width="300"
								height="300"
								ref="destImgCanvas"
				></canvas>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
/**
 * image pasting into canvas
 *
 * @param {string} canvas_id - canvas id
 * @param {boolean} autoresize - if canvas will be resized
 */
/*
function CLIPBOARD_CLASS (canvas_id, autoresize) {
	var _self = this;
	var canvas = document.getElementById(canvas_id);
	console.log(canvas);
	var ctx = document.getElementById(canvas_id).getContext('2d');
	//handlers
	document.addEventListener('paste', function (e) { _self.paste_auto(e); }, false);

	//on paste
	this.paste_auto = function (e) {
		if (e.clipboardData) {
			var items = e.clipboardData.items;
			if (!items) return;

			//access data directly
			var is_image = false;
			for (var i = 0; i < items.length; i++) {
				if (items[ i ].type.indexOf('image') !== -1) {
					//image
					var blob = items[ i ].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
					is_image = true;
				}
			}
			if (is_image == true) {
				e.preventDefault();
			}
		}
	};
	//draw pasted image to canvas
	this.paste_createImage = function (source) {
		var pastedImage = new Image();
		pastedImage.onload = function () {
			if (autoresize == true) {
				//resize
				canvas.width = pastedImage.width * 2;
				canvas.height = pastedImage.height;
			} else {
				//clear canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			ctx.drawImage(pastedImage, 0, 0);
			ctx.drawImage(pastedImage, pastedImage.width, 0);
			let iw = pastedImage.width;
			let ih = pastedImage.height;

			ctx.save();
			ctx.translate(iw, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(pastedImage, 0, 0, iw / 2, ih, 0, 0, iw / 2, ih);
			ctx.restore();

			ctx.save();
			ctx.translate(iw, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(pastedImage, iw / 2, 0, iw, ih, -1 * iw / 2, 0, iw, ih);
			ctx.restore();

		};
		pastedImage.src = source;
	};
}
*/
export default {
	name: 'HelloWorld',
	props: {
		msg: String,
	},
	computed: {
		srcImgCanvas () {
			return this.$refs.srcImgCanvas;
		},
		srcImgCtx () {
			return this.srcImgCanvas.getContext('2d');
		},
		destImgCanvas () {
			return this.$refs.destImgCanvas;
		},
		destImgCtx () {
			return this.destImgCanvas.getContext('2d');
		},
		srcImgMin () {
			if (this.srcImg) {
				return this.srcImg.width / -2;
			}
			return -1;
		},
		srcImgMax () {
			if (this.srcImg) {
				return this.srcImg.width / 2;
			}
			return 1;
		},
	},
	data () {
		return {
			srcImg: null,
			srcImgUrl: '',
			srcImgTranslate: 0,
			srcImgRotate: 0,
			destImg: null,
		};
	},
	watch: {
		srcImgTranslate () {
			this.updateSrcImg();
		},
		srcImgRotate () {
			this.updateSrcImg();
		},
	},
	methods: {
		handlePaste (event) {
			if (event.clipboardData) {
				let items = event.clipboardData.items;
				if (!items) return;

				//access data directly
				let is_image = false;
				for (let i = 0; i < items.length; i++) {
					if (items[ i ].type.indexOf('image') !== -1) {
						//image
						let blob = items[ i ].getAsFile();
						let URLObj = window.URL || window.webkitURL;
						this.srcImgUrl = URLObj.createObjectURL(blob);
						this.updateSrcImg();
						// this.paste_createImage(source);
						is_image = true;
					}
				}
				if (is_image === true) {
					event.preventDefault();
				}
			}
		},
		updateSrcImg () {
			this.srcImg = new Image();
			this.srcImg.onload = () => {
				//this.srcImgCtx.clearRect(0, 0, this.srcImgCanvas.width, this.srcImgCanvas.height);
				this.srcImgCanvas.width = this.srcImg.width;
				this.srcImgCanvas.height = this.srcImg.height;

				let cw = this.srcImgCanvas.width,
						ch = this.srcImgCanvas.height;
				let ctx = this.srcImgCtx;

				ctx.save();
				ctx.translate(cw/2, ch/2);

				ctx.translate(this.srcImgTranslate, 0);
				ctx.rotate(this.srcImgRotate * Math.PI / 180);
				ctx.drawImage(this.srcImg, -cw/2, -ch/2);
				ctx.restore();

				ctx.beginPath();
				ctx.moveTo(cw / 2, 0);
				ctx.lineTo(cw / 2, ch);
				ctx.stroke();
			};
			this.srcImg.src = this.srcImgUrl;
		},
		updateDestImg () {},
	},
	mounted () {
		let _self = this;
		document.addEventListener('paste', function (e) { _self.handlePaste(e); }, false);
		this.srcImgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Max_Hardcore_2015.jpg/800px-Max_Hardcore_2015.jpg';
		this.updateSrcImg();
		// const clipboard = new CLIPBOARD_CLASS('srcImgCanvas', true);
		// console.log(clipboard);
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}

#srcImgCanvas {
	max-width: 500px;
	max-height: 500px;
}
</style>
