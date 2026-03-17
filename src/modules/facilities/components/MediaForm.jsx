import React, { useState, useRef } from 'react';
import { X, ImageUp, Film, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../../shared/components/Buttons';
import '../styles/mediaForm.css';

const MediaForm = ({ setView, spaceId, hook }) => {
    const { uploadMedia, loading, refreshDetails } = hook;
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null); // 'IMAGE' o 'VIDEO'
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Detectar tipo
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Solo se permiten imágenes o videos');
            return;
        }

        setSelectedFile(file);
        setFileType(isImage ? 'IMAGE' : 'VIDEO');

        // Crear preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('description', description);

        const result = await uploadMedia(spaceId, formData);

        if (result) {
            // Limpiar y cerrar
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            refreshDetails();
            setView(false);
        }
    };

    return (
        <div className="modal_overlay">
            <div className="modal_content media_modal">
                {/* Encabezado */}
                <div className="modal_header">
                    <h3><ImageUp size={18} />Cargar Multimedia</h3>
                    <button className="close_modal_btn" onClick={() => setView(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal_body form_upload_media">
                    <form onSubmit={handleSubmit} className="upload_form">
                        <div className="upload_zone center" onClick={() => fileInputRef.current.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                            />

                            {previewUrl ? (
                                <>
                                    {fileType === 'IMAGE' ? (
                                        <img src={previewUrl} alt="Preview" className="media_preview_img" />
                                    ) : (
                                        <video src={previewUrl} controls autoPlay={true} className="media_preview_video" />
                                    )}
                                    <div className="change_file_overlay center">
                                        <ImageUp size={24} />
                                        <span>Cambiar archivo</span>
                                    </div>
                                </>
                            ) : (
                                <div className="empty_upload_state center">
                                    <ImageUp size={48} strokeWidth={1.5} />
                                    <p>Haz clic para seleccionar una imagen o video</p>
                                    <span>Formatos permitidos: JPG, PNG, WEBP, MP4</span>
                                </div>
                            )}
                        </div>

                        <div className="form_group">
                            <label>Descripción (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe una breve descripción para este archivo..."
                                rows="3"
                            />
                        </div>

                        <div className="modal_footer">
                            <Button
                                text="Cancelar"
                                variant="cancel"
                                onClick={() => setView(false)}
                                type="button"
                            />
                            <Button
                                text={loading ? "Subiendo..." : "Subir Archivo"}
                                type="submit"
                                loading={loading}
                                disabled={!selectedFile || loading}
                                Icon={CheckCircle2}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MediaForm;
