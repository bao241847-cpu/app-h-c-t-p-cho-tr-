import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const AUTHORIZED_TEACHER_EMAIL = 'bao241847@gmail.com';

// Cấu hình Firebase
// Tự động nhận từ biến môi trường Vite hoặc cho phép giáo viên nhập trực tiếp trong app
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForSpellingApp',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'be-vui-hoc-chinh-ta.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'be-vui-hoc-chinh-ta',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'be-vui-hoc-chinh-ta.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '440084493101',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:440084493101:web:98a7b6c5d4e3f2',
};

// Cho phép lưu cấu hình do giáo viên nhập từ console nếu chưa gắn env
const STORAGE_KEY_CUSTOM_CONFIG = 'chinh_ta_lop2_custom_firebase_config';

export function getActiveFirebaseConfig() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    } catch {
      // Ignored
    }
  }
  return defaultFirebaseConfig;
}

export function saveActiveFirebaseConfig(config: typeof defaultFirebaseConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(config));
  }
}

// Khởi tạo Firebase App an toàn
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

try {
  const config = getActiveFirebaseConfig();
  if (getApps().length === 0) {
    appInstance = initializeApp(config);
  } else {
    appInstance = getApps()[0];
  }
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);
} catch (err) {
  console.warn('Firebase khởi tạo ở chế độ Offline Fallback:', err);
}

export const app = appInstance;
export const auth = authInstance;
export const db = firestoreInstance;

/**
 * Đăng nhập Google cho Giáo Viên
 * Kiểm tra nghiêm ngặt: CHỈ email bao241847@gmail.com mới có quyền Giáo viên
 */
export async function loginTeacherWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!auth) {
    return {
      success: false,
      error: 'Chưa khởi tạo được Firebase Authentication. Vui lòng kiểm tra cấu hình Firebase.',
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const email = (user.email || '').toLowerCase().trim();
    if (email === AUTHORIZED_TEACHER_EMAIL.toLowerCase()) {
      return { success: true, user };
    } else {
      // Đăng nhập bằng email khác -> Báo không có quyền và tự động đăng xuất
      await signOut(auth);
      return {
        success: false,
        error: `Tài khoản (${user.email}) không có quyền giáo viên. Chỉ tài khoản ${AUTHORIZED_TEACHER_EMAIL} mới được phép quản trị.`,
      };
    }
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google:', error);
    let msg = error?.message || 'Đăng nhập Google thất bại';
    if (error?.code === 'auth/popup-closed-by-user') {
      msg = 'Bạn đã đóng cửa sổ đăng nhập Google.';
    } else if (error?.code === 'auth/unauthorized-domain') {
      msg = 'Tên miền chưa được thêm vào Authorized Domains trên Firebase Console. Vui lòng thêm tên miền này vào mục Authentication -> Settings.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Đăng xuất
 */
export async function logoutTeacher(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Lắng nghe trạng thái đăng nhập
 */
export function subscribeAuthState(callback: (user: User | null, isTeacher: boolean) => void) {
  if (!auth) {
    callback(null, false);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    const isTeacher = !!user && (user.email || '').toLowerCase() === AUTHORIZED_TEACHER_EMAIL.toLowerCase();
    callback(user, isTeacher);
  });
}
