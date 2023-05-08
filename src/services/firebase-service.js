import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// import firebaseConfig from 'src/config/firebase-config'

const config = {
	apiKey: 'AIzaSyCsPsiQzZ4MUv_ulFMm9YWdhodrxxucS_M',
	authDomain: 'chromium-d89a6.firebaseapp.com',
	projectId: 'chromium-d89a6',
	storageBucket: 'chromium-d89a6.appspot.com',
	messagingSenderId: '1071094919653',
	appId: '1:1071094919653:web:c05cd2b613251c6880bf0c'
}

const app = initializeApp(config)
export const auth = getAuth(app)

export default app
