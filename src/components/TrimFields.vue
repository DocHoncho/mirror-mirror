<template>
	<v-row>
		<v-col>
			<v-text-field
					type="number"
					label="Left"
					v-model="curTrim.left"
					min="0"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					type="number"
					label="Right"
					v-model="curTrim.right"
					min="0"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					type="number"
					label="Top"
					v-model="curTrim.top"
					min="0"
					v-on:input="handleInput"
			></v-text-field>
		</v-col>
		<v-col>
			<v-text-field
					type="number"
					label="Bottom"
					v-model="curTrim.bottom"
					min="0"
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
		}
	}
};
</script>
