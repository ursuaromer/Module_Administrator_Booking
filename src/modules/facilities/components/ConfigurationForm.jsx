import React, { useState, useEffect, useCallback } from 'react';
import { Building2, MessageCircle, Share2, Pencil, Settings, UserCheck, Plus, Mail } from 'lucide-react';
import { FaTiktok, FaFacebook, FaInstagram } from 'react-icons/fa6';
import Button from '../../../shared/components/Buttons';
import { getImageUrl } from '../../../shared/utils/formarText';
import '../styles/configs.css';
import { InputField } from '../../../shared/components/FormComponents';
import RegisterUserModal from './RegisterUserModal';
import userService from '../../users/services/userService';
import { useAuth } from '../../auth/context/AuthContext';

const ConfigurationForm = ({ initialData, onSave, onCancel, loading, companyId }) => {
    const { roles } = useAuth();
    const isSystem = roles?.includes('system');

    const [formData, setFormData] = useState({
        social_facebook: '',
        social_instagram: '',
        social_whatsapp: '',
        social_tiktok: ''
    });

    const [files, setFiles] = useState({ logo: null, banner: null });
    const [previews, setPreviews] = useState({ logo: '', banner: '' });
    const [owners, setOwners] = useState([]);
    const [showRegisterOwner, setShowRegisterOwner] = useState(false);

    const loadOwners = useCallback(async () => {
        if (!companyId || !isSystem) return;
        try {
            const res = await userService.getUsersByCompany(companyId);
            const data = res?.data || [];
            setOwners(data.filter(u => u.role_name === 'super_admin'));
        } catch {
            setOwners([]);
        }
    }, [companyId, isSystem]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                social_facebook: initialData.social_facebook || '',
                social_instagram: initialData.social_instagram || '',
                social_whatsapp: initialData.social_whatsapp || '',
                social_tiktok: initialData.social_tiktok || ''
            });
            setPreviews({
                logo: getImageUrl(initialData.logo_url) || '',
                banner: getImageUrl(initialData.banner_url) || ''
            });
        }
        loadOwners();
    }, [initialData, loadOwners]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            setFiles(prev => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviews(prev => ({ ...prev, [name]: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.logo) data.append('logo', files.logo);
        if (files.banner) data.append('banner', files.banner);
        onSave(data);
    };

    return (
        <section className="branding_form animate-fade-in">
            <div className="section-title">
                <h3><Settings size={18} /> Branding y Redes Sociales</h3>
                <p>Personaliza la apariencia de tu empresa y enlaza tus redes sociales.</p>
            </div>

            {/* Propietario — solo system puede gestionar */}
            {isSystem && (
                <aside className="form-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3><UserCheck size={18} /> Propietario de la Empresa</h3>
                        <Button
                            text="Agregar Propietario"
                            variant="primary"
                            Icon={Plus}
                            type="button"
                            onClick={() => setShowRegisterOwner(true)}
                        />
                    </div>

                    {owners.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
                            No hay propietario registrado para esta empresa.
                        </p>
                    ) : (
                        <div className="owners-list">
                            {owners.map(owner => (
                                <div key={owner.user_company_id} className="owner-card">
                                    <div className="owner-avatar">
                                        {owner.avatar_url
                                            ? <img src={getImageUrl(owner.avatar_url)} alt={owner.first_name} />
                                            : <UserCheck size={24} />
                                        }
                                    </div>
                                    <div className="owner-info">
                                        <strong>{owner.first_name} {owner.last_name}</strong>
                                        <span><Mail size={13} /> {owner.email}</span>
                                        <span className={`status_badge ${owner.is_enabled ? 'active' : 'inactive'}`}>
                                            {owner.is_enabled ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            )}

            <form className="config_form" onSubmit={handleSubmit}>
                <aside className="form-section">
                    <h3><Building2 size={18} /> Branding e Imágenes</h3>

                    <div className="branding-preview-container">
                        {previews.banner ? (
                            <img src={previews.banner} alt="Banner Preview" className="preview-banner-img" />
                        ) : (
                            <div className="preview-banner-placeholder">
                                <Building2 size={48} opacity={0.2} />
                            </div>
                        )}
                        <label className="edit-icon-btn banner-edit">
                            <Pencil size={16} />
                            <input type="file" name="banner" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>

                        <div className="preview-logo-overlay">
                            <div className='logo_profile center'>
                                {previews.logo ? (
                                    <img src={previews.logo} alt="Logo Preview" className="preview-logo-img" />
                                ) : (
                                    <div className="preview-logo-placeholder"><Building2 size={32} /></div>
                                )}
                                <label className="edit-icon-btn logo-edit">
                                    <Pencil size={14} />
                                    <input type="file" name="logo" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>

                <aside className="form-section">
                    <h3><Share2 size={18} /> Redes Sociales</h3>
                    <div className="form-grid">
                        <InputField label='Facebook (URL)' icon={FaFacebook} name='social_facebook' variant='variant2'
                            value={formData.social_facebook} onChange={handleChange}
                            placeholder='https://facebook.com/tu-pagina' iconPosition='left' />
                        <InputField label='Instagram (URL)' icon={FaInstagram} name='social_instagram' variant='variant2'
                            value={formData.social_instagram} onChange={handleChange}
                            placeholder='https://instagram.com/tu-perfil' iconPosition='left' />
                        <InputField label='WhatsApp (Número)' icon={MessageCircle} name='social_whatsapp' variant='variant2'
                            value={formData.social_whatsapp} onChange={handleChange}
                            placeholder='Ej: 51999888777' iconPosition='left' />
                        <InputField label='TikTok (URL)' icon={FaTiktok} name='social_tiktok' variant='variant2'
                            value={formData.social_tiktok} onChange={handleChange}
                            placeholder='https://tiktok.com/@tu-usuario' iconPosition='left' />
                    </div>
                </aside>

                <div className="form-actions">
                    <Button text="Cancelar" variant="cancel" onClick={onCancel} type="button" />
                    <Button text="Guardar Configuración" variant="primary" type="submit" loading={loading} disabled={loading} />
                </div>
            </form>

            {isSystem && (
                <RegisterUserModal
                    isOpen={showRegisterOwner}
                    onClose={() => setShowRegisterOwner(false)}
                    companyId={Number(companyId)}
                    context="company"
                    onSuccess={loadOwners}
                />
            )}
        </section>
    );
};

export default ConfigurationForm;
