<template>
	<v-container>
		<v-row>
			1. Copy image data into clipboard or press Print Screen <br>
			2. Press Ctrl+V (page/iframe must be focused):
		</v-row>
		<v-row>
			<v-col>
				<div class="viewport"
						 ref="srcView"
				>
					<canvas style="border:1px solid grey;"
									id="srcImgCanvas"
									width="300"
									height="300"
									ref="srcImgCanvas"
					></canvas>
				</div>
				<v-slider
						v-model="srcImg.translate"
						label="Shift"
						:min="srcImgMin"
						:max="srcImgMax"
						v-on:input="updateSrcImg"
				>
					<template v-slot:append>
						<v-text-field
								v-model="srcImg.translate"
								class="mt-0 pt-0"
								hide-details
								single-line
								type="number"
								style="width:60px"
								v-on:input="updateSrcImg"
						></v-text-field>
					</template>
				</v-slider>
				<v-slider
						v-model="srcImg.rotation"
						label="Rotation"
						min="-180"
						max="180"
						v-on:input="updateSrcImg"
				>
					<template v-slot:append>
						<v-text-field
								v-model="srcImg.rotation"
								class="mt-0 pt-0"
								hide-details
								single-line
								type="number"
								style="width:60px"
								v-on:input="updateSrcImg"
						></v-text-field>
					</template>
				</v-slider>
				<v-color-picker
						v-model="srcImg.bgColor"
						v-on:input="updateSrcImg"
				></v-color-picker>
			</v-col>
			<v-col>
				<canvas style="border:1px solid grey;"
								id="destImgCanvas"
								width="300"
								height="300"
								ref="destImgCanvas"
				></canvas>
			</v-col>
		</v-row>
		<v-row>
			<v-col>

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
			srcImg: {
				url: '',
				width: 0,
				height: 0,
				translate: 0,
				rotation: 0,
				bgColor: 'white',
			},
			destImg: null,
		};
	},
	watch: {},
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
						// let blob = items[ i ].getAsFile();
						createImageBitmap(items[ i ].getAsFile()).then((bmp) => {
							this.srcImg.bitmap = bmp;
							this.srcImg.width = bmp.width;
							this.srcImg.height= bmp.height;
							this.srcImg.rotation = 0;
							this.srcImg.translate = 0;

							this.updateSrcImg();
						});
						// let URLObj = window.URL || window.webkitURL;
						// this.srcImgUrl = URLObj.createObjectURL(blob);
						// this.updateSrcImg();
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
			if (this.srcImg.bitmap) {
				this.srcImg.width = this.srcImg.bitmap.width - Math.abs(this.srcImg.translate);
				this.srcImg.height = this.srcImg.bitmap.height;

				const canvas = this.srcImgCanvas,
						ctx = this.srcImgCtx,
						cw = this.srcImg.width,
						ch = this.srcImg.height;

				canvas.width = cw;
				canvas.height = ch;

				ctx.fillStyle = this.srcImg.bgColor;
				ctx.fillRect(0, 0, cw, ch);

				ctx.save();
				ctx.translate(cw / 2, ch / 2); // Center canvas for rotation
				ctx.rotate(this.srcImg.rotation * Math.PI / 180);

				// ctx.translate(this.srcImg.translate, 0);
				let sx = this.srcImg.translate < 0 ? -this.srcImg.translate : 0,
						sw = cw;

				ctx.drawImage(this.srcImg.bitmap, sx, 0, sw, ch, -cw / 2, -ch / 2, cw, ch);
				ctx.restore();

				// Draw dest left, normal orientation
				let dctx = this.destImgCtx,
						dcanv = this.destImgCanvas;
				dcanv.width = this.srcImgCanvas.width*2
				dcanv.height = this.srcImgCanvas.height;

				dctx.drawImage(this.srcImgCanvas, 0, 0, cw/2, ch, 0, 0, cw/2, ch);
				dctx.drawImage(this.srcImgCanvas, cw/2, 0, cw/2, ch, cw*1.5, 0, cw/2, ch);

				dctx.save();
				dctx.translate(cw, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas, 0,    0, cw/2, ch, 0,      0, cw/2, ch);
				dctx.drawImage(this.srcImgCanvas, cw/2, 0, cw/2, ch, -cw/2,    0,    cw/2, ch);
				dctx.restore();

				//let ctx2 = this.$refs.srcImgCanvas2.getContext('2d');
				ctx.strokeStyle = 'green';
				ctx.lineWidth = '3';
				ctx.beginPath();
				ctx.setLineDash([10, 10]);
				ctx.moveTo(cw / 2, 0);
				ctx.lineTo(cw / 2, ch);
				ctx.stroke();
			}
			// let img = new Image();
			// img.onload = () => {
			// 	this.srcImg.width = img.width;
			// 	this.srcImg.height = img.height;
			//
			// 	const cw = this.srcImg.width,
			// 			ch = this.srcImg.height;
			// 	let ctx = this.srcImgCtx;
			//
			// 	this.srcImgCanvas.width = cw;
			// 	this.srcImgCanvas.height = ch;
			// 	this.$refs.srcImgCanvas2.width = cw;
			// 	this.$refs.srcImgCanvas2.height = ch;
			//
			// 	this.srcImgCtx.fillStyle = this.srcImg.bgColor;
			// 	this.srcImgCtx.fillRect(0, 0, cw, ch);
			//
			// 	ctx.save();
			// 	ctx.translate(cw / 2, ch / 2); // Center canvas for rotation
			// 	ctx.rotate(this.srcImg.rotation * Math.PI / 180);
			//
			// 	ctx.translate(this.srcImg.translate, 0);
			// 	ctx.drawImage(img, -cw / 2, -ch / 2);
			// 	ctx.restore();
			//
			// 	let ctx2 = this.$refs.srcImgCanvas2.getContext('2d');
			// 	ctx2.strokeStyle = 'green';
			// 	ctx2.lineWidth = '3';
			// 	ctx2.beginPath();
			// 	ctx2.setLineDash([10, 10]);
			// 	ctx2.moveTo(cw / 2, 0);
			// 	ctx2.lineTo(cw / 2, ch);
			// 	ctx2.stroke();
			// };
			// img.src = this.srcImg.url;
		},
		updateDestImg () {

		},
	},
	mounted () {
		let _self = this;
		document.addEventListener('paste', function (e) { _self.handlePaste(e); }, false);
		this.srcImg.url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Max_Hardcore_2015.jpg/800px-Max_Hardcore_2015.jpg';
		this.updateSrcImg();
		// const clipboard = new CLIPBOARD_CLASS('srcImgCanvas', true);
		// console.log(clipboard);
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped
			 lang=scss
>
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

#srcImg {
	max-width: 250px;
}

.viewport {
	position: relative;

	canvas {
		//position: absolute;
	}
}

#srcImgCanvas, #srcImgCanvas2 {

	max-height: 300px;
	/*display:none;*/
}
#destImgCanvas {
	max-height: 300px;
}
</style>
