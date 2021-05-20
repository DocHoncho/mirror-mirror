<template>
	<v-row>
		<v-col>
			<v-text-field
					v-model="curTrim.left"
					label="Left"
					min="0"
					type="number"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					v-model="curTrim.right"
					label="Right"
					min="0"
					type="number"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					v-model="curTrim.top"
					label="Top"
					min="0"
					type="number"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					v-model="curTrim.bottom"
					label="Bottom"
					min="0"
					type="number"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
	</v-row>
</template>
<script>
export default {
	name: 'TrimField',
	props: {
		trim: {
			type: Object,
			default () {
				return {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				};
			},
		},
	},
	data () {
		return {
			curTrim: this.trim,
		};
	},
	methods: {
		handleInput () {
			this.$emit('input', this.curTrim);
		},
	},
};
</script>
