/**
 * SucursalFullConfigModal
 *
 * Modal de configuración de sucursal con 2 secciones (tabs):
 *   1. Operativo   → Horarios, precio mínimo, características, logo
 *   2. Redes Soc.  → WhatsApp, Facebook, Instagram, TikTok, YouTube
 *
 * Guarda:
 *   - Tab 1 (texto)  → PUT /companies/update/:id
 *   - Tab 1 (logo)   → POST /companies/config/:id (multipart)
 *   - Tab 2          → POST /companies/config/:id (multipart)
 *
 * Nota: Pagos, datos bancarios y propietario se gestionan
 *       en "Configuración de Empresa" (ConfigCompany → tab Pagos).
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    Clock, DollarSign, Layers, Check, AlertCircle, Plus, X,
    Share2, Upload, Building2, Info, Image,
    MessageCircle, Instagram, Youtube
} from 'lucide-react';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import Button from '../../../shared/components/Buttons';
import {
    InputField,
    FormSection, FormRow
} from '../../../shared/components/FormComponents';
import { Modal } from '../../../shared/components';
import companyService from '../services/companyService';
import configurationService from '../services/configurationService';
import { getImageUrl } from '../../../shared/utils/formarText';
import toast from 'react-hot-toast';
import '../styles/sucursalFullConfig.css';

// ── Tabs del modal ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'operativo', label: 'Operativo',     Icon: Clock  },
    { id: 'redes',     label: 'Redes Sociales', Icon: Share2 },
];

// ── Helper: previsualizar imagen local ────────────────────────────────────────
const ImageUploadPreview = ({ label, fieldName, currentUrl, onFileSelect, hint, size, mediaId, onRemove }) => {
    const inputRef = useRef();
    const [preview, setPreview] = useState(null);
    const [removing, setRemoving] = useState(false);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
        onFileSelect(fieldName, file);
    };

    const displayUrl = preview || getImageUrl(currentUrl);

    const handleRemoveClick = async (e) => {
        e.stopPropagation();
        if (preview) {
            setPreview(null);
            onFileSelect(fieldName, null);
            return;
        }
        if (mediaId && onRemove) {
            setRemoving(true);
            try {
                await onRemove(fieldName);
            } finally {
                setRemoving(false);
            }
        }
    };

    return (
        <div className={`sfc_image_upload${size === 'lg' ? ' size_lg' : ''}`}>
            <span className="sfc_image_label">{label}</span>
            <div
                className={`sfc_image_box ${displayUrl ? 'has_image' : ''}`}
                onClick={() => inputRef.current?.click()}
                title="Haz clic para subir imagen"
            >
                {displayUrl ? (
                    <img src={displayUrl} alt={label} className="sfc_image_preview" />
                ) : (
                    <div className="sfc_image_placeholder">
                        <Upload size={24} />
                        <span>Subir imagen</span>
                    </div>
                )}
            </div>
            {hint && <p className="sfc_image_hint">{hint}</p>}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleChange}
            />
            {displayUrl && (
                <button
                    type="button"
                    className="sfc_image_remove"
                    onClick={handleRemoveClick}
                    disabled={removing}
                >
                    <X size={12} /> {removing ? 'Eliminando...' : 'Quitar'}
                </button>
            )}
        </div>
    );
};

// ── Footer reutilizable de cada tab ─────────────────────────────────────────
const TabFooter = ({ info, loading, onClose }) => (
    <div className="sfc_tab_footer">
        {info && (
            <div className="sfc_footer_info">
                <AlertCircle size={14} />
                <span>{info}</span>
            </div>
        )}
        <div className="sfc_footer_btns">
            <Button type="button" text="Cancelar" variant="cancel" onClick={onClose} />
            <Button
                type="submit"
                text={loading ? 'Guardando...' : 'Guardar'}
                Icon={Check}
                disabled={loading}
            />
        </div>
    </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const SucursalFullConfigModal = ({ sucursal, onClose, onSaveSuccess }) => {
    const [activeTab, setActiveTab] = useState('operativo');

    // Estado Tab 1: Operativo
    const [opData, setOpData] = useState({
        opening_time: '', closing_time: '', min_price: '', features: []
    });
    const [newFeature, setNewFeature] = useState('');
    const [loadingOp, setLoadingOp] = useState(false);

    // Estado Tab 2: Redes Sociales
    const [cfgData, setCfgData] = useState({
        social_whatsapp: '', whatsapp_message: '',
        social_facebook: '', social_instagram: '',
        social_tiktok: '',   social_youtube: '',
    });
    const [logoMediaId, setLogoMediaId] = useState(null);
    const [cfgFiles, setCfgFiles] = useState({});
    const [loadingCfg, setLoadingCfg] = useState(false);
    const [loadingInit, setLoadingInit] = useState(true);

    // ── Cargar datos iniciales ───────────────────────────────────────────────
    useEffect(() => {
        if (!sucursal) return;

        const rawFeatures = sucursal.features;
        const features = Array.isArray(rawFeatures)
            ? rawFeatures
            : (typeof rawFeatures === 'string' && rawFeatures.trim()
                ? rawFeatures.split(',').map(f => f.trim()).filter(Boolean)
                : []);

        setOpData({
            opening_time: sucursal.opening_time || '',
            closing_time: sucursal.closing_time || '',
            min_price: sucursal.min_price || '',
            features,
        });

        const loadConfig = async () => {
            try {
                const res = await configurationService.getConfiguration(sucursal.company_id);
                if (res?.data) {
                    const d = res.data;
                    setCfgData({
                        social_whatsapp:  d.social_whatsapp  || '',
                        whatsapp_message: d.whatsapp_message || '',
                        social_facebook:  d.social_facebook  || '',
                        social_instagram: d.social_instagram || '',
                        social_tiktok:    d.social_tiktok    || '',
                        social_youtube:   d.social_youtube   || '',
                    });
                    setLogoMediaId(d.logo_media_id || null);
                }
            } catch {
                // Config aún no existe → defaults en blanco
            } finally {
                setLoadingInit(false);
            }
        };
        loadConfig();
    }, [sucursal]);

    // ── Handlers Tab Operativo ───────────────────────────────────────────────
    const handleOpChange = (e) => {
        const { name, value } = e.target;
        setOpData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFeature = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const val = newFeature.trim();
            if (val && !opData.features.includes(val)) {
                setOpData(prev => ({ ...prev, features: [...prev.features, val] }));
                setNewFeature('');
            }
        }
    };

    const handleRemoveFeature = (idx) => {
        setOpData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
    };

    const saveOperativo = async (e) => {
        e.preventDefault();
        setLoadingOp(true);
        try {
            const payload = {
                ...opData,
                min_price: parseFloat(opData.min_price) || 0,
                features: opData.features.join(','),
            };
            await companyService.updateCompany(sucursal.company_id, payload);

            if (cfgFiles.logo) {
                const fd = new FormData();
                fd.append('logo', cfgFiles.logo);
                await configurationService.saveConfiguration(sucursal.company_id, fd);
                setCfgFiles(prev => { const next = { ...prev }; delete next.logo; return next; });
            }

            toast.success('Configuración operativa actualizada');
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar configuración operativa');
        } finally {
            setLoadingOp(false);
        }
    };

    // ── Handlers Tab Redes Sociales ──────────────────────────────────────────
    const handleCfgChange = (e) => {
        const { name, value } = e.target;
        setCfgData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (fieldName, file) => {
        setCfgFiles(prev => ({ ...prev, [fieldName]: file }));
    };

    const handleRemoveImage = async (fieldName) => {
        try {
            await configurationService.deleteConfigMedia(sucursal.company_id, fieldName);
            if (fieldName === 'logo') {
                setLogoMediaId(null);
                if (onSaveSuccess) onSaveSuccess();
            }
            toast.success('Imagen eliminada correctamente');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al eliminar la imagen');
        }
    };

    const saveCfg = async (e) => {
        e.preventDefault();
        setLoadingCfg(true);
        try {
            const fd = new FormData();
            Object.entries(cfgData).forEach(([key, val]) => {
                if (val !== '' && val !== null && val !== undefined) fd.append(key, val);
            });
            Object.entries(cfgFiles).forEach(([key, file]) => {
                if (file) fd.append(key, file);
            });
            const res = await configurationService.saveConfiguration(sucursal.company_id, fd);
            toast.success(res.message || 'Configuración guardada correctamente');
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al guardar configuración');
        } finally {
            setLoadingCfg(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Configuración — ${sucursal.name}`}
            Icon={Building2}
            size="large"
        >
            <div className="sfc_wrapper">
                {/* ── Tab Bar ── */}
                <nav className="sfc_tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`sfc_tab_btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {loadingInit ? (
                    <div className="sfc_loading">
                        <div className="sfc_spinner" />
                        <span>Cargando configuración...</span>
                    </div>
                ) : (
                    <div className="sfc_content">

                        {/* ══ TAB 1: OPERATIVO ══════════════════════════════════════════ */}
                        {activeTab === 'operativo' && (
                            <form onSubmit={saveOperativo} className="sfc_form">
                                <FormSection title="Horarios de Atención" Icon={Clock}>
                                    <FormRow>
                                        <InputField
                                            label="Hora de Apertura"
                                            name="opening_time"
                                            type="time"
                                            value={opData.opening_time}
                                            onChange={handleOpChange}
                                            required
                                        />
                                        <InputField
                                            label="Hora de Cierre"
                                            name="closing_time"
                                            type="time"
                                            value={opData.closing_time}
                                            onChange={handleOpChange}
                                            required
                                        />
                                    </FormRow>
                                </FormSection>

                                <FormSection title="Tarifas" Icon={DollarSign}>
                                    <FormRow>
                                        <InputField
                                            label="Precio Mínimo Referencial (S/)"
                                            name="min_price"
                                            type="number"
                                            step="0.10"
                                            min="0"
                                            value={opData.min_price}
                                            onChange={handleOpChange}
                                            placeholder="Ej: 45.00"
                                            icon={DollarSign}
                                        />
                                    </FormRow>
                                </FormSection>

                                <FormSection title="Características y Servicios" Icon={Layers}>
                                    <div className="sfc_features">
                                        <FormRow>
                                            <InputField
                                                label="Nueva característica"
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                onKeyDown={handleAddFeature}
                                                placeholder="Ej: Cafetería, WiFi, Duchas..."
                                            />
                                            <Button
                                                type="button"
                                                text="Agregar"
                                                onClick={handleAddFeature}
                                                variant="primary"
                                                Icon={Plus}
                                            />
                                        </FormRow>
                                        <div className="sfc_tags_container">
                                            {opData.features.length === 0 ? (
                                                <p className="sfc_empty_tags">No hay características añadidas aún.</p>
                                            ) : (
                                                opData.features.map((f, i) => (
                                                    <span key={i} className="sfc_tag">
                                                        {f}
                                                        <button type="button" onClick={() => handleRemoveFeature(i)}>
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Logo / Imagen Principal" Icon={Image}>
                                    <div className="sfc_info_banner">
                                        <Info size={14} />
                                        <span>Esta imagen se muestra en el portal de reservas como portada de la sucursal.</span>
                                    </div>
                                    <div className="sfc_logo_row">
                                        <ImageUploadPreview
                                            label="Imagen principal"
                                            fieldName="logo"
                                            currentUrl={sucursal.logo_url}
                                            onFileSelect={handleFileSelect}
                                            hint="JPG, PNG o WEBP. Mínimo 400×400 px."
                                            size="lg"
                                            mediaId={logoMediaId}
                                            onRemove={handleRemoveImage}
                                        />
                                    </div>
                                </FormSection>

                                <TabFooter
                                    info="Los cambios afectan la visibilidad en el portal de reservas."
                                    loading={loadingOp}
                                    onClose={onClose}
                                />
                            </form>
                        )}

                        {/* ══ TAB 2: REDES SOCIALES ════════════════════════════════════ */}
                        {activeTab === 'redes' && (
                            <form onSubmit={saveCfg} className="sfc_form">
                                <FormSection title="WhatsApp" Icon={MessageCircle}>
                                    <FormRow>
                                        <InputField
                                            label="Número WhatsApp (con código país)"
                                            name="social_whatsapp"
                                            type="tel"
                                            value={cfgData.social_whatsapp}
                                            onChange={handleCfgChange}
                                            placeholder="Ej: 51987654321"
                                            icon={MessageCircle}
                                        />
                                    </FormRow>
                                    <FormRow>
                                        <InputField
                                            label="Mensaje predefinido (al abrir chat)"
                                            name="whatsapp_message"
                                            value={cfgData.whatsapp_message}
                                            onChange={handleCfgChange}
                                            placeholder="Ej: Hola! Quiero información sobre reservas..."
                                            icon={MessageCircle}
                                        />
                                    </FormRow>
                                </FormSection>

                                <FormSection title="Redes Sociales" Icon={Share2}>
                                    <FormRow>
                                        <InputField
                                            label="Facebook"
                                            name="social_facebook"
                                            type="url"
                                            value={cfgData.social_facebook}
                                            onChange={handleCfgChange}
                                            placeholder="https://facebook.com/tupagina"
                                            icon={FaFacebook}
                                        />
                                        <InputField
                                            label="Instagram"
                                            name="social_instagram"
                                            type="url"
                                            value={cfgData.social_instagram}
                                            onChange={handleCfgChange}
                                            placeholder="https://instagram.com/tuperfil"
                                            icon={Instagram}
                                        />
                                    </FormRow>
                                    <FormRow>
                                        <InputField
                                            label="TikTok"
                                            name="social_tiktok"
                                            type="url"
                                            value={cfgData.social_tiktok}
                                            onChange={handleCfgChange}
                                            placeholder="https://tiktok.com/@tuperfil"
                                            icon={FaTiktok}
                                        />
                                        <InputField
                                            label="YouTube"
                                            name="social_youtube"
                                            type="url"
                                            value={cfgData.social_youtube}
                                            onChange={handleCfgChange}
                                            placeholder="https://youtube.com/@tucanal"
                                            icon={Youtube}
                                        />
                                    </FormRow>
                                </FormSection>

                                <TabFooter
                                    info="Los enlaces se mostrarán en la ficha pública de la sucursal."
                                    loading={loadingCfg}
                                    onClose={onClose}
                                />
                            </form>
                        )}

                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SucursalFullConfigModal;
