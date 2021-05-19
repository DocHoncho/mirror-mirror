<template>
	<v-app>
		<v-app-bar
				app
				color="primary"
				dark
		>
			<div class="d-flex align-center">
				<div class="app-title">
					<span>MIR</span><span class="mflip">R</span><span class="mflip">I</span><span class="mflip">M</span>&nbsp;<span class="mflip">R</span><span class="mflip">O</span><span class="mflip">R</span><span>ROR</span>
				</div>
			</div>

			<v-spacer></v-spacer>

		</v-app-bar>

		<v-main>
			<v-container>
				<v-row>
					1. Copy image data into clipboard or press Print Screen <br>
					2. Press Ctrl+V (page/iframe must be focused):
				</v-row>
				<v-row>
					<v-col cols="12"
								 sm="4"
					>
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
						<div>
							<trim-field
									v-model="srcImg.trim"
							></trim-field>
						</div>
						<div style="min-width: 300px">
							<v-slider
									v-model="srcImg.translate"
									label="Shift"
									:min="srcImgMin"
									:max="srcImgMax"
									v-on:input="update"
							>
								<template v-slot:append>
									<v-text-field
											v-model="srcImg.translate"
											class="mt-0 pt-0"
											hide-details
											single-line
											type="number"
											style="width:60px"
											v-on:input="update"
									></v-text-field>
								</template>
							</v-slider>
							<v-slider
									v-model="srcImg.rotation"
									label="Rotation"
									min="-180"
									max="180"
									v-on:input="update"
							>
								<template v-slot:append>
									<v-text-field
											v-model="srcImg.rotation"
											class="mt-0 pt-0"
											hide-details
											single-line
											type="number"
											style="width:60px"
											v-on:input="update"
									></v-text-field>
								</template>
							</v-slider>
							<v-color-picker
									v-model="srcImg.bgColor"
									v-on:input="update"
							></v-color-picker>
						</div>
					</v-col>
					<v-col cols="12"
								 sm="8"
					>
						<canvas style="border:1px solid grey;"
										id="destImgCanvas"
										width="300"
										height="300"
										ref="destImgCanvas"
						></canvas>
						<v-row>
							<v-col>
								<v-text-field
										v-model="saveFilenameTemplate"
										label="Filename"
										persistent-hint
										:hint="getSaveFilename()"
								></v-text-field>
							</v-col>
							<v-col>
								<v-select
										:items="saveFileTypes"
										v-model="saveFileType"
										item-text="label"
										item-value="value"
										return-object
								></v-select>
								<v-text-field
										v-if="saveFileType.hasQuality"
										type="number"
										label="Quality"
										v-model="saveCompression"
										min=1
										max=100
								></v-text-field>
							</v-col>
							<v-col>
								<v-btn
										icon
										v-on:click="doSave"
								>
									<v-icon>mdi-content-save</v-icon>
								</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-row>
					<v-col>

					</v-col>
				</v-row>
			</v-container>
		</v-main>
	</v-app>
</template>

<script>
// import TrimField from './components/TrimFields';

let path = require('path');

export default {
	name: 'App',
	components: {
		// TrimField,
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
		let data = {
			saveUrl: '',
			saveFilenameTemplate: '{{timestamp}}',
			saveFileType: 'image/png',
			saveCompression: 75,
			isDragging: false,
			srcImg: {
				trim: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				},
				origFileName: '',
				url: '',
				width: 0,
				height: 0,
				translate: 0,
				rotation: 0,
				bgColor: 'white',
			},
			destImg: null,
			filenameMacros: {
				'timestamp': () => {
					return Date.now().toString();
				},
				'fileName': () => {
					return this.srcImg.origFileName;
				},
			},
			saveFileTypes: [
				{
					label: 'PNG',
					value: 'image/png',
					ext: 'png',
					hasQuality: false,
				},
				{
					label: 'JPEG',
					value: 'image/jpeg',
					ext: 'jpg',
					hasQuality: true,
				},
			],
		};

		data.saveFileType = data.saveFileTypes[ 0 ];
		return data;
	},
	watch: {},
	methods: {
		getSaveFilename () {
			let str = this.saveFilenameTemplate;
			let macros = [...str.matchAll(/{{(\w*)}}/g)];
			for (let i = 0; i < macros.length; i++) {
				const macro = macros[ i ];
				if (macro[ 1 ] in this.filenameMacros) {
					str = str.replace(macro[ 0 ], this.filenameMacros[ macro[ 1 ] ](str));
				}
			}

			return str + '.' + this.saveFileType.ext;
		},
		doSave () {
			this.saveUrl = this.destImgCanvas.toDataURL(this.saveFileType.value, this.saveCompression / 100.0);

			let link = document.createElement('a');
			link.download = this.getSaveFilename();
			link.href = 'data:' + this.saveUrl;
			link.click();
		},
		createBitmap (imgSrc) {
			createImageBitmap(imgSrc).then((bmp) => {
				this.srcImg.bitmap = bmp;
				this.srcImg.width = bmp.width;
				this.srcImg.height = bmp.height;
				this.srcImg.rotation = 0;
				this.srcImg.translate = 0;

				this.update();
			}).catch((e) => {
				console.log(e);
			});
		},
		loadUrl (url) {
			let img = new Image();
			img.onload = () => {
				this.createBitmap(img);
			};
			img.src = url;
		},
		handlePaste (event) {
			if (event.clipboardData) {
				let items = event.clipboardData.items;
				if (!items) return;

				//access data directly
				for (let i = 0; i < items.length; i++) {
					const item = items[ i ];

					if (item.type.indexOf('image') !== -1) {
						let file = items[ i ].getAsFile();
						this.createBitmap(file);
						this.srcImg.origFileName = path.basename(file.name, path.extname(file.name));

						event.preventDefault();
					} else if (item.type.indexOf('plain') !== -1) {
						item.getAsString((e) => {
							if (e.indexOf('http') !== -1) {
								this.loadUrl(e);
								let t = new URL(e);
								this.srcImg.origFileName = path.basename(t.pathname, path.extname(t.pathname));
								event.preventDefault();
							}
						});
					}
				}
			}
		},
		update () {
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
				dcanv.width = this.srcImgCanvas.width * 2;
				dcanv.height = this.srcImgCanvas.height;

				dctx.drawImage(this.srcImgCanvas, 0, 0, cw / 2, ch, 0, 0, cw / 2, ch);
				dctx.drawImage(this.srcImgCanvas, cw / 2, 0, cw / 2, ch, cw * 1.5, 0, cw / 2, ch);

				dctx.save();
				dctx.translate(cw, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas, 0, 0, cw / 2, ch, 0, 0, cw / 2, ch);
				dctx.drawImage(this.srcImgCanvas, cw / 2, 0, cw / 2, ch, -cw / 2, 0, cw / 2, ch);
				dctx.restore();

				//let ctx2 = this.$refs.srcImgCanvas2.getContext('2d');
				ctx.strokeStyle = 'green';
				ctx.lineWidth = 5;
				ctx.beginPath();
				ctx.setLineDash([10, 10]);
				ctx.moveTo(cw / 2, 0);
				ctx.lineTo(cw / 2, ch);
				ctx.stroke();
			}
		},
	},
	mounted () {
		document.addEventListener('paste', (e) => { this.handlePaste(e); }, false);
		document.addEventListener('dragenter', (e) => {

			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('dragleave', (e) => {

			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('dragover', (e) => {

			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('drop', (e) => {
			console.log(e.dataTransfer.files);
			e.preventDefault();
			e.stopPropagation();
		});

		this.$refs.srcImgCanvas.addEventListener('mousedown', () => { this.isDragging = true; });
		this.$refs.srcImgCanvas.addEventListener('mouseup', () => { this.isDragging = false; });
		this.$refs.srcImgCanvas.addEventListener('mouseleave', () => { this.isDragging = false; });
		this.$refs.srcImgCanvas.addEventListener('mousemove', (e) => {
			if (this.isDragging) {
				if (e.movementX > 0) {
					this.srcImg.translate += 1;
					if (this.srcImg.translate > this.srcImg.width / 2) {
						this.srcImg.translate = this.srcImg.width / 2;
					}
					this.update();
				} else if (e.movementX < 0) {
					this.srcImg.translate -= 1;
					if (this.srcImg.translate < -this.srcImg.width / 2) {
						this.srcImg.translate = -this.srcImg.width / 2;
					}

					this.update();
				}
			}
		});

		this.srcImg.url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Max_Hardcore_2015.jpg/800px-Max_Hardcore_2015.jpg';
		this.update();
	},
};
</script>
<style lang=scss>
.app-title {
	font-size: 20px;

	.mflip {
		display: inline-block;
		transform: scale(-1, 1);
	}
}

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
}

#srcImgCanvas, #srcImgCanvas2 {
	max-height: 300px;
	cursor: ew-resize;
}

#destImgCanvas {
	max-height: 300px;
}
</style>
