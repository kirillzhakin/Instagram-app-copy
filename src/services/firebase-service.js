import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../config/firebase-config'

const app = initializeApp(firebaseConfig)
const storage = getStorage()

export const upload = async (file, currentUser) => {
	const fileRef = ref(storage, currentUser.uid + '.png')
	await uploadBytes(fileRef, file)
	return await getDownloadURL(fileRef)
}

export const auth = getAuth(app)

export default app
