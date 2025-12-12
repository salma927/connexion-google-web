import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/AuthService';
import logoImage from '../assets/logo.png';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await authService.login(email, password);
    
    if (result.success) {
      if (result.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Log In</h2>
        <span className="page-indicator">2 / 14</span>
      </div>

      <div className="auth-card">
        <div className="logo-container">
          <div 
            className="logo-circle" 
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid #f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <img 
              src={logoImage} 
              alt="Logo"
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain"
              }}
            />
          </div>
        </div>

        <h1 className="welcome-title">Bienvenue !</h1>

        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              placeholder="Email ou numero de telephone*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-lg"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              placeholder="Mot de passe*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control form-control-lg"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Connexion...
              </>
            ) : 'Continuer'}
          </button>
        <button 
          type="button"
          className="btn btn-danger w-100 btn-lg mt-3"
              onClick={async () => {
               const result = await authService.loginWithGoogle();

               if (result.success) {
                 if (result.isAdmin) {
                 navigate('/admin/dashboard');
                    } else {
                    navigate('/dashboard');
                       }
                   } else {
                 setError(result.message);
                  }
                      }}
                   >
                     Connexion avec Google 
                   </button>

          <p className="auth-link-text mt-3">
            Vous n&apos;avez pas de compte ?{' '}
            <Link to="/signup" className="text-primary fw-bold text-decoration-none">
              Inscrivez-vous
            </Link>
          </p>
        </form>
      </div>

      <div className="auth-footer">
        <a href="#" className="footer-link">Terms of Use</a>
        <span className="footer-separator">|</span>
        <a href="#" className="footer-link">Privacy Policy</a>
      </div>
    </div>
  );
};

export default Login;
