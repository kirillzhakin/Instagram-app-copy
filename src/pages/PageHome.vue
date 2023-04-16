<template>
	<q-page class="desktop-screen q-pa-md">
		<div class="row q-col-gutter-lg">
			<div class="col-12 col-sm-8">
				<template v-if="!isLoading && posts.length">
					<q-card
						v-for="post in posts"
						:key="post.id"
						class="my-card q-mb-md"
						flat
						bordered
					>
						<q-item>
							<q-item-section avatar>
								<q-avatar>
									<img src="./../assets/my-avatar.jpg" />
								</q-avatar>
							</q-item-section>

							<q-item-section>
								<q-item-label class="text-bold">kirill_zhakin</q-item-label>
								<q-item-label caption> {{ post.location }} </q-item-label>
							</q-item-section>
						</q-item>

						<q-separator />

						<q-img :src="post.imageUrl" />

						<q-card-section>
							<div>{{ post.caption }}</div>
							<div class="text-caption text-gray">
								{{ viewDate(post.date) }}
							</div>
						</q-card-section>
					</q-card>
				</template>

				<template v-else-if="!isLoading && !posts.length">
					<h5 class="text-center text-grey">No posts</h5>
				</template>

				<template v-else>
					<q-card flat bordered>
						<q-item>
							<q-item-section avatar>
								<q-skeleton type="QAvatar" animation="fade" size="40px" />
							</q-item-section>

							<q-item-section>
								<q-item-label>
									<q-skeleton type="text" animation="fade" />
								</q-item-label>
								<q-item-label caption>
									<q-skeleton type="text" animation="fade" />
								</q-item-label>
							</q-item-section>
						</q-item>

						<q-skeleton height="200px" square animation="fade" />

						<q-card-section>
							<q-skeleton type="text" class="text-subtitle2" animation="fade" />
							<q-skeleton
								type="text"
								class="text-subtitle2"
								width="50%"
								animation="fade"
							/>
						</q-card-section>
					</q-card>
				</template>
			</div>
			<div class="col-4 large-screen">
				<q-item class="fixed">
					<q-item-section avatar>
						<q-avatar size="48px">
							<img src="./../assets/my-avatar.jpg" />
						</q-avatar>
					</q-item-section>

					<q-item-section>
						<q-item-label class="text-bold">kirill_zhakin</q-item-label>
						<q-item-label caption>Kirill Zhakin </q-item-label>
					</q-item-section>
				</q-item>
			</div>
		</div>
	</q-page>
</template>

<script>
import { date } from 'quasar'
import { openDB } from 'idb'

export default {
	name: 'PageHome',
	data() {
		return {
			posts: [],
			isLoading: false
		}
	},

	methods: {
		getPosts() {
			this.isLoading = true
			this.$axios
				.get(`${process.env.API}/posts`)
				.then(({ data }) => {
					this.posts = data
					this.isLoading = false
					if (!navigator.onLine) {
						this.getOfflinePosts()
					}
				})
				.catch(err => {
					this.$q.dialog({
						title: 'Error',
						message: 'Posts not found'
					})
					this.isLoading = false
				})
		},
		getOfflinePosts() {
			const db = openDB('workbox-background-sync').then(db => {
				db.getAll('requests')
					.then(badRequests => {
						{
							badRequests.forEach(req => {
								if (req.queueName === 'createPost') {
									const request = new Request(
										req.requestData.url,
										req.requestData
									)
								}
							})
						}
					})
					.catch(err => {
						console.log('Error IndexDB:', err)
					})
			})
		}
	},
	computed: {
		viewDate() {
			return value => date.formatDate(value, 'DD MMM YYYY')
		}
	},
	created() {
		this.getPosts()
	}
}
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
