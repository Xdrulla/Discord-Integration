import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const discordId = ref(null)
  const displayName = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isAdmin = computed(() => role.value === 'admin')
  const isRH = computed(() => role.value === 'rh')
  const isAdminOrRH = computed(() => role.value === 'admin' || role.value === 'rh')
  const isAuthenticated = computed(() => !!user.value)

  async function fetchUserData(firebaseUser) {
    if (!firebaseUser) return
    const docRef = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      const data = snap.data()
      role.value = data.role ?? 'leitor'
      discordId.value = data.discordId ?? null
      displayName.value = data.displayName ?? firebaseUser.displayName ?? firebaseUser.email
    } else {
      role.value = 'leitor'
      discordId.value = null
      displayName.value = firebaseUser.displayName ?? firebaseUser.email
    }
  }

  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser
        if (firebaseUser) {
          await fetchUserData(firebaseUser)
        } else {
          role.value = null
          discordId.value = null
          displayName.value = null
        }
        loading.value = false
        initialized.value = true
        resolve()
      })
    })
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    await fetchUserData(cred.user)
    return cred.user
  }

  async function register(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      role: 'leitor',
      displayName: email.split('@')[0],
      createdAt: new Date(),
    })
    role.value = 'leitor'
    displayName.value = email.split('@')[0]
    return cred.user
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    role.value = null
    discordId.value = null
    displayName.value = null
  }

  async function getToken() {
    if (!user.value) return null
    return await user.value.getIdToken()
  }

  async function updateDiscordId(newDiscordId) {
    if (!user.value) return
    await updateDoc(doc(db, 'users', user.value.uid), { discordId: newDiscordId })
    discordId.value = newDiscordId
  }

  async function updateDisplayName(name) {
    if (!user.value) return
    await updateDoc(doc(db, 'users', user.value.uid), { displayName: name })
    displayName.value = name
  }

  async function changePassword(currentPassword, newPassword) {
    if (!user.value) return
    const credential = EmailAuthProvider.credential(user.value.email, currentPassword)
    await reauthenticateWithCredential(user.value, credential)
    await updatePassword(user.value, newPassword)
  }

  return {
    user,
    role,
    discordId,
    displayName,
    loading,
    initialized,
    isAdmin,
    isRH,
    isAdminOrRH,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    getToken,
    updateDiscordId,
    updateDisplayName,
    changePassword,
  }
})
