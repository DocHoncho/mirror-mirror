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
					v{{ $APP_VERSION }}
				</div>
			</div>

			<v-spacer></v-spacer>
			<v-btn
					icon
			>
				<v-icon>mdi-help-circle-outline</v-icon>
			</v-btn>
			<a
					href="https://github.com/mirrim-rorror/mirrim-rorror"
					class="v-btn v-btn--icon v-btn--round theme--dark v-size--default"
			>
				<v-icon>mdi-github</v-icon>
			</a>
			<v-btn
					icon
			>
				<v-icon>mdi-cog</v-icon>
			</v-btn>
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
						<div ref="srcView"
								 class="viewport"
						>
							<canvas id="srcImgCanvas"
											ref="srcImgCanvas"
											height="300"
											style="border:1px solid grey;"
											width="300"
							></canvas>
						</div>

					</v-col>
					<v-col cols="12"
								 sm="8"
					>
						<canvas id="destImgCanvas"
										ref="destImgCanvas"
										height="300"
										style="border:1px solid grey;"
										width="300"
						></canvas>

					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<div>
							<v-switch
									v-model="symmetricalBox"
									:label="boxModeLabel"
							/>
							<div
									v-if="symmetricalBox"
									style="min-width: 300px"
							>
								<v-slider
										v-model="srcImg.bbox.left"
										:max="srcImgMax"
										:min="0"
										label="Left"
										v-on:input="update"
								>
									<template v-slot:append>
										<v-text-field
												v-model="srcImg.bbox.left"
												class="mt-0 pt-0"
												hide-details
												single-line
												style="width:60px"
												type="number"
												v-on:input="update"
										></v-text-field>
									</template>
								</v-slider>
								<v-slider
										v-model="srcImg.bbox.right"
										:max="srcImgMax"
										:min="0"
										label="Right"
										v-on:input="update"
								>
									<template v-slot:append>
										<v-text-field
												v-model="srcImg.bbox.right"
												class="mt-0 pt-0"
												hide-details
												single-line
												style="width:60px"
												type="number"
												v-on:input="update"
										></v-text-field>
									</template>
								</v-slider>
							</div>
							<div
									v-else
									style="min-width: 300px"
							>
								<v-slider
										v-model="srcImg.bbox.center"
										:max="srcImgMax"
										:min="0"
										label="Center"
										v-on:input="update"
								>
									<template v-slot:append>
										<v-text-field
												v-model="srcImg.bbox.center"
												class="mt-0 pt-0"
												hide-details
												single-line
												style="width:60px"
												type="number"
												v-on:input="update"
										></v-text-field>
									</template>
								</v-slider>
							</div>
							<div
									style="min-width: 300px"
							>
								<v-slider
										v-model="srcImg.rotation"
										label="Rotation"
										max="180"
										min="-180"
										v-on:input="update"
								>
									<template v-slot:append>
										<v-text-field
												v-model="srcImg.rotation"
												class="mt-0 pt-0"
												hide-details
												single-line
												style="width:60px"
												type="number"
												v-on:input="update"
										></v-text-field>
									</template>
								</v-slider>
								<v-color-picker
										v-model="srcImg.bgColor"
										v-on:input="update"
								></v-color-picker>
							</div>
						</div>
					</v-col>
					<v-col>
						<v-text-field
								v-model="saveFilenameTemplate"
								:hint="getSaveFilename()"
								label="Filename"
								persistent-hint
						></v-text-field>
					</v-col>
					<v-col>
						<v-select
								v-model="saveFileType"
								:items="saveFileTypes"
								item-text="label"
								item-value="value"
								return-object
						></v-select>
						<v-text-field
								v-if="saveFileType.hasQuality"
								v-model="saveCompression"
								label="Quality"
								max=100
								min=1
								type="number"
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
			</v-container>
		</v-main>
		<v-overlay
				absolute
				:value="isFileDragging"
		>
			<v-row>
				<v-col>
					<v-icon>mdi-download</v-icon>
					Drop file to load
				</v-col>
			</v-row>
		</v-overlay>
	</v-app>
</template>

<script>
let path = require('path');

export default {
	name: 'App',
	components: {},
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
				return this.srcImg.width;
			}
			return 1;
		},
		boxModeLabel () {
			if (this.symmetricalBox) {
				return 'Symmetric';
			} else {
				return 'Asymmetric';
			}
		},
	},
	data () {
		let data = {
			dragCounter: 0,
			isUpdating: false,
			saveUrl: '',
			saveFilenameTemplate: '{{timestamp}}',
			saveFileType: 'image/png',
			saveCompression: 75,
			isDragging: false,
			isFileDragging: false,
			symmetricalBox: false,
			srcImg: {
				bbox: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				},
				trim: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				},
				origFileName: '',
				url: '',
				width: 0,
				height: 0,
				translate: 0,
				rotation: 0,
				bgColor: '#FFF',
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
				this.srcImg.bbox.left = 0;
				this.srcImg.bbox.right = bmp.width;
				this.srcImg.bbox.top = 0;
				this.srcImg.bbox.bottom = bmp.height;
				this.srcImg.bbox.center = bmp.width / 3;
				this.srcImg.rotation = 0;
				this.srcImg.translate = this.srcImg.width / 2;

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
		drawSourceImage () {
			let ctx = this.srcImgCtx;

			ctx.save();
			ctx.translate(this.srcImg.width / 2, this.srcImg.height / 2); // Center canvas for rotation
			ctx.rotate(this.srcImg.rotation * Math.PI / 180);

			ctx.drawImage(this.srcImg.bitmap,
					0, 0,
					this.srcImg.width, this.srcImg.height,
					-this.srcImg.width / 2, -this.srcImg.height / 2,
					this.srcImg.width, this.srcImg.height);
			ctx.restore();
		},
		drawDestImage () {
			// Draw dest left, normal orientation
			let dctx = this.destImgCtx,
					dcanv = this.destImgCanvas;

			let bb = this.srcImg.bbox;

			dcanv.width = bb.width * 2;
			dcanv.height = this.srcImg.height;

			if (this.symmetricalBox) {
				// Left
				dctx.drawImage(this.srcImgCanvas,
						bb.left, 0,
						bb.width / 2, this.srcImg.height,
						0, 0,
						bb.width / 2, this.srcImg.height);
				dctx.save();
				dctx.translate(bb.width, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas,
						bb.left, 0,
						bb.width / 2, this.srcImg.height,
						0, 0,
						bb.width / 2, this.srcImg.height);
				dctx.restore();

				// Right
				dctx.drawImage(this.srcImgCanvas,
						bb.left + bb.width / 2, 0,
						bb.width / 2, this.srcImg.height,
						1.5 * bb.width, 0,
						bb.width / 2, this.srcImg.height);

				dctx.save();
				dctx.translate(bb.width, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas,
						bb.width / 2 + bb.left, 0,
						bb.width / 2, this.srcImg.height,
						-bb.width / 2, 0,
						bb.width / 2, this.srcImg.height);
				dctx.restore();
			} else {
				// Left
				dctx.drawImage(this.srcImgCanvas,
						bb.left, 0,
						bb.center, this.srcImg.height,
						0, 0,
						bb.center, this.srcImg.height);
				dctx.save();
				dctx.translate(bb.width, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas,
						bb.left, 0,
						bb.center, this.srcImg.height,
						bb.width-2*bb.center, 0,
						bb.center, this.srcImg.height);
				dctx.restore();

				// Right
				const tw = bb.right-bb.center;
				dctx.drawImage(this.srcImgCanvas,
						bb.center, 0,
						tw, this.srcImg.height,
						bb.center+bb.width, 0,
						tw, this.srcImg.height);
				dctx.save();
				dctx.translate(bb.width, 0);
				dctx.scale(-1, 1);
				dctx.drawImage(this.srcImgCanvas,
						bb.center, 0,
						tw, this.srcImg.height,
						-tw+(bb.width-2*bb.center), 0,
						tw, this.srcImg.height);
				dctx.restore();
			}
		},
		drawSourceOverlay () {
			let ctx = this.srcImgCtx;

			ctx.strokeStyle = 'green';
			ctx.lineWidth = 5;

			ctx.strokeRect(this.srcImg.bbox.left, this.srcImg.bbox.top,
					this.srcImg.bbox.width, this.srcImg.bbox.bottom);

			ctx.beginPath();
			ctx.setLineDash([10, 10]);
			// let cx = this.srcImg.bbox.left + (this.srcImg.bbox.width / 2);
			let cx = this.srcImg.bbox.center;
			ctx.moveTo(cx, 0);
			ctx.lineTo(cx, this.srcImg.height);
			ctx.stroke();

		},
		update () {
			if (!this.isUpdating) {
				this.isUpdating = true;

				if (this.srcImg.bitmap) {
					const canvas = this.srcImgCanvas,
							ctx = this.srcImgCtx;

					this.srcImg.bbox.width = (this.srcImg.bbox.right - this.srcImg.bbox.left);
					if (this.symmetricalBox) {
						this.srcImg.bbox.center = this.srcImg.bbox.width + this.srcImg.bbox.left;
						this.srcImg.bbox.center = this.srcImg.bbox.left + (this.srcImg.bbox.right / 2);
					}

					canvas.width = this.srcImg.width;
					canvas.height = this.srcImg.height;

					ctx.fillStyle = this.srcImg.bgColor;
					ctx.fillRect(0, 0, canvas.width, canvas.height);

					this.drawSourceImage();
					this.drawDestImage();
					this.drawSourceOverlay();
				}

				this.isUpdating = false;
			}
		},
	},
	mounted () {
		document.addEventListener('paste', (e) => { this.handlePaste(e); }, false);
		document.addEventListener('dragenter', (e) => {
			this.dragCounter++;
			this.isFileDragging = true;
			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('dragleave', (e) => {
			this.dragCounter--;
			if (this.dragCounter === 0) {
				this.isFileDragging = false;
			}
			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('dragover', (e) => {
			this.isFileDragging = true;
			e.preventDefault();
			e.stopPropagation();
		});
		document.addEventListener('drop', (e) => {
			let file = e.dataTransfer.files[ 0 ];
			this.createBitmap(file);
			this.srcImg.origFileName = path.basename(file.name, path.extname(file.name));
			this.update();

			this.isFileDragging = false;
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

		this.srcImg.url = 'https://thispersondoesnotexist.com/image';
		this.loadUrl(this.srcImg.url);
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
