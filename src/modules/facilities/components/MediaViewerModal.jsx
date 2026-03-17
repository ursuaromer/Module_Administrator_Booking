import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import '../styles/mediaViewerModal.css';

const MediaViewerModal = ({ media, onClose, onNext, onPrev, totalMedia, currentIndex }) => {
    if (!media) return null;

    const isVideo = media.type === 'VIDEO' || 
                   (media.url && (media.url.toLowerCase().endsWith('.mp4') || media.url.toLowerCase().endsWith('.mov')));

    return (
        <div className="media_viewer_overlay" onClick={onClose}>
            <div className="media_viewer_container" onClick={e => e.stopPropagation()}>
                <button className="media_viewer_close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="media_viewer_content">
                    <div className="media_display_area">
                        {isVideo ? (
                            <video 
                                src={media.url} 
                                controls 
                                autoPlay 
                                className="media_viewer_element"
                            />
                        ) : (
                            <img 
                                src={media.url} 
                                alt="Multimedia" 
                                className="media_viewer_element" 
                            />
                        )}
                        
                        {totalMedia > 1 && (
                            <>
                                <button className="nav_btn prev" onClick={onPrev}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="nav_btn next" onClick={onNext}>
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="media_viewer_info">
                        <div className="info_header">
                            <h3>Detalle Multimedia</h3>
                            <span className="media_counter">{currentIndex + 1} / {totalMedia}</span>
                        </div>
                        
                        <div className="info_body">
                            <label>Descripción</label>
                            <p>{media.description || 'Sin descripción disponible.'}</p>
                        </div>

                        <div className="info_footer">
                            <span className={`media_type_badge ${media.type?.toLowerCase()}`}>
                                {media.type === 'IMAGE' ? 'Imagen' : 'Video'}
                            </span>
                            {media.is_primary && (
                                <span className="primary_badge">Principal</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaViewerModal;
