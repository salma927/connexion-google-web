import { signInWithPopup 
} from "firebase/auth";
import { googleProvider 
} from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Liste des emails admin
const ADMIN_EMAILS = [
  'admin@studyhub.com',
  'administrateur@studyhub.com',
  'superadmin@studyhub.com'
];

class AuthService {
  // Vérifier si un email est admin
  isAdminEmail(email) {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // LOGIN
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = this.isAdminEmail(email);
     
      return {
        success: true,
        message: "Connexion réussie",
        user: userCredential.user,
        isAdmin
      };
    } catch (error) {
      console.error("Erreur login:", error);
      return {
        success: false,
        message: this.getErrorMessage(error.code),
        isAdmin: false
      };
    }
  }
    // LOGIN AVEC GOOGLE
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Vérifier si admin
      const isAdmin = this.isAdminEmail(user.email);

      // Ajouter/sauvegarder dans Firestore si pas admin
      if (!isAdmin) {
        await setDoc(doc(db, "users", user.uid), {
          nom: user.displayName?.split(" ")[0] || "",
          prenom: user.displayName?.split(" ")[1] || "",
          email: user.email,
          etablissement: "",
          userType: "Étudiant",
          niveau: "",
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      return {
        success: true,
        user,
        isAdmin
      };

    } catch (error) {
      console.error("Erreur Google Login :", error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }


  // SIGNUP SIMPLE
  async signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error("Erreur signup:", error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // SIGNUP AVEC DÉTAILS COMPLETS
  async signupWithDetails({
    nom,
    prenom,
    email,
    password,
    etablissement,
    userType = "Étudiant",
    niveau = null,
    matiere = null
  }) {
    try {
      // Empêcher l'inscription avec un email admin
      if (this.isAdminEmail(email)) {
        return {
          success: false,
          message: "Cet email est réservé à l'administration"
        };
      }

      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Sauvegarder les détails dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        nom,
        prenom,
        email,
        etablissement,
        userType,
        niveau,
        matiere,
        createdAt: serverTimestamp()
      });

      return {
        success: true,
        message: "Inscription réussie",
        user
      };
    } catch (error) {
      console.error("Erreur signupWithDetails:", error);
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // RÉCUPÉRER TOUS LES UTILISATEURS (pour l'admin)
  async getUsers() {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
     
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
       
        // Exclure les emails admin
        if (!this.isAdminEmail(data.email)) {
          users.push({
            id: doc.id,
            uid: doc.id,
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            etablissement: data.etablissement || '',
            niveau: data.niveau || '',
            type: data.userType || 'Étudiant',
            dateInscription: data.createdAt,
            status: 'Actif'
          });
        }
      });
     
      return users;
    } catch (error) {
      console.error("Erreur getUsers:", error);
      return [];
    }
  }

  // STREAM EN TEMPS RÉEL DES UTILISATEURS
  getUsersStream(callback) {
    const usersRef = collection(db, "users");
   
    return onSnapshot(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
       
        // Exclure les emails admin
        if (!this.isAdminEmail(data.email)) {
          users.push({
            id: doc.id,
            uid: doc.id,
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            etablissement: data.etablissement || '',
            niveau: data.niveau || '',
            type: data.userType || 'Étudiant',
            dateInscription: data.createdAt,
            status: 'Actif'
          });
        }
      });
     
      callback(users);
    });
  }

  // LOGOUT
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Erreur logout:", error);
      return { success: false, message: error.message };
    }
  }

  // MESSAGES D'ERREUR PERSONNALISÉS
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/invalid-email': 'Email invalide',
      'auth/operation-not-allowed': 'Opération non autorisée',
      'auth/weak-password': 'Le mot de passe est trop faible (min 6 caractères)',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/user-not-found': 'Aucun compte avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Email ou mot de passe incorrect'
    };
   
    return errorMessages[errorCode] || 'Une erreur est survenue';
  }
}

// Exporter une instance unique (Singleton)
export default new AuthService();
