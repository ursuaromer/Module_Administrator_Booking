import '../styles/login.css';
import { FaRegUser } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { FiEyeOff } from "react-icons/fi";
import { IoArrowForwardOutline } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import useLogin from '../hooks/useLogin';
import Animation from '../components/Animation';

const Login = () => {
    const { handleSubmit, handleShowPassword, usuario, setUsuario, contrasena, setContrasena, showPassword } = useLogin();

    return (
        <div className="login_page">

            {/* Contenido principal */}
            <section className="login_seccion">
                <div className="admin_header">
                    <MdAdminPanelSettings className='admin_icon' />
                    <h2>Admin BS</h2>
                </div>

                <div className="login-form-container">
                    <h3>Iniciar Sesión</h3>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form_group">
                            <label htmlFor="usuario">Usuario</label>
                            <input
                                type="text"
                                id="usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder=""
                            />
                            <FaRegUser className='icon' />
                        </div>
                        <div className="form_group">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="contrasena"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder=""
                            />
                            {showPassword ?
                                <FiEyeOff className='icon icon_password' onClick={handleShowPassword} /> :
                                <IoEyeOutline className='icon icon_password' onClick={handleShowPassword} />
                            }
                        </div>

                        <div className="forgot-password">
                            <a href="#" className="forgot-link">¿Olvidaste la contraseña?</a>
                        </div>

                        <button type="submit" className="login-button">
                            Iniciar Sesión 
                            <IoArrowForwardOutline />
                        </button>
                    </form>
                </div>

                <div className="footer_text">
                    <p>Sistema de Super Administradores de Booking Sport</p>
                    <p>© Copyright. FiftyOne Dev - 2025</p>
                </div>
            </section >

            {/* Elementos animados de fondo */}
            <section className="animated_background">
                <Animation />

                {/* center */}
                <div className="center"></div>
            </section >
        </div >
    );
};

export default Login;