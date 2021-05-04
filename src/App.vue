<template>
	<v-app>
		<v-app-bar
				app
				color="primary"
				dark
		>
			<div class="d-flex align-center">
				<div class="app-title">
					<span>MIRROR</span>&nbsp;|&nbsp;<span class="mflip">MIRROR</span>
				</div>
			</div>

			<v-spacer></v-spacer>

		</v-app-bar>

		<v-main>
			<HelloWorld />
		</v-main>
	</v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
	name: 'App',

	components: {
		HelloWorld,
	},

	data: () => ({
		//
	}),
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

</style>
