import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '../../../shared/components/Buttons';
import Modal from '../../../shared/components/Modal';
import { InputField, SelectField, FormRow, FormActions } from '../../../shared/components/FormComponents';
import {
    Building2, CreditCard, ListOrdered, ChevronUp, ChevronDown,
    Trash2, Save, Plus, Pencil, X, ImagePlus, Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';
import paymentAccountService from '../services/paymentAccountService';

const EMPTY_FORM = {
    account_alias: '', account_number: '', account_name: '',
    bank_name: '', bank_account_type: '', bank_account_cci: '', bank_currency: 'PEN'
};

// ── Formulario de cuenta usando shared components ─────────────────────────────
const AccountForm = ({ method, initial = {}, onSave, onCancel, saving }) => {
    const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState(initial.qr_url || '');
    const qrInputRef = useRef(null);

    const isBank   = method?.category === 'transferencia_bancaria';
    const isWallet = method?.category === 'billetera_digital';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleQrChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setQrFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setQrPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        const fields = isBank
            ? ['account_alias', 'bank_name', 'bank_account_type', 'account_number', 'bank_account_cci', 'account_name', 'bank_currency']
            : ['account_alias', 'account_number', 'account_name'];
        fields.forEach(f => {
            if (form[f] !== undefined && form[f] !== '') fd.append(f, form[f]);
        });
        if (qrFile) fd.append('qr_image', qrFile);
        onSave(fd);
    };

    return (
        <form className="pa-account-form" onSubmit={handleSubmit}>

            {/* Campos comunes */}
            <FormRow>
                <InputField
                    label="Alias / Etiqueta"
                    name="account_alias"
                    value={form.account_alias}
                    onChange={handleChange}
                />
                <InputField
                    label="Número de cuenta / Teléfono"
                    name="account_number"
                    value={form.account_number}
                    onChange={handleChange}
                />
            </FormRow>
            <FormRow>
                <InputField
                    label="Nombre del titular"
                    name="account_name"
                    value={form.account_name}
                    onChange={handleChange}
                />
                {isBank && (
                    <InputField
                        label="Banco"
                        name="bank_name"
                        value={form.bank_name}
                        onChange={handleChange}
                    />
                )}
            </FormRow>

            {/* Campos extra banco */}
            {isBank && (
                <>
                    <FormRow>
                        <SelectField
                            label="Tipo de cuenta"
                            name="bank_account_type"
                            value={form.bank_account_type}
                            onChange={handleChange}
                            options={[
                                { value: 'AHORROS',   label: 'Ahorros' },
                                { value: 'CORRIENTE', label: 'Corriente' },
                            ]}
                        />
                        <SelectField
                            label="Moneda"
                            name="bank_currency"
                            value={form.bank_currency}
                            onChange={handleChange}
                            options={[
                                { value: 'PEN', label: 'PEN — Soles' },
                                { value: 'USD', label: 'USD — Dólares' },
                            ]}
                        />
                    </FormRow>
                    <FormRow>
                        <InputField
                            label="CCI (Código Interbancario)"
                            name="bank_account_cci"
                            value={form.bank_account_cci}
                            onChange={handleChange}
                        />
                    </FormRow>
                </>
            )}

            {/* QR upload para billeteras digitales */}
            {isWallet && (
                <div className="pa-qr-field">
                    <span className="pa-qr-label">
                        <ImagePlus size={14} /> Código QR
                    </span>
                    <div className="pa-qr-upload" onClick={() => qrInputRef.current?.click()}>
                        {qrPreview ? (
                            <img src={qrPreview} alt="QR" className="pa-qr-preview" />
                        ) : (
                            <span className="pa-qr-placeholder">
                                <ImagePlus size={36} />
                                <span>Click para subir imagen</span>
                            </span>
                        )}
                        <input
                            ref={qrInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleQrChange}
                        />
                    </div>
                    {qrPreview && (
                        <button
                            type="button"
                            className="pa-qr-remove"
                            onClick={() => { setQrFile(null); setQrPreview(''); }}
                        >
                            <X size={13} /> Quitar imagen
                        </button>
                    )}
                </div>
            )}

            <FormActions>
                <Button text="Cancelar" variant="cancel" size="sm" onClick={onCancel} disabled={saving} />
                <Button text={saving ? 'Guardando...' : 'Guardar'} variant="submit" size="sm" type="submit" disabled={saving} />
            </FormActions>
        </form>
    );
};

// ── Fila de cuenta configurada ────────────────────────────────────────────────
const AccountRow = ({ account, canManage, onEdit, onDelete }) => (
    <div className="account-row">
        <div className="account-row-main">
            {account.qr_url && (
                <img src={account.qr_url} alt="QR" className="account-qr-thumb" />
            )}
            <div className="account-row-info">
                <strong>{account.account_alias || account.account_name || `Cuenta #${account.payment_account_id}`}</strong>
                {account.account_number && <span>{account.account_number}</span>}
                {account.bank_name && (
                    <span>{account.bank_name}{account.bank_account_type ? ` · ${account.bank_account_type}` : ''}</span>
                )}
                {account.bank_account_cci && <span>CCI: {account.bank_account_cci}</span>}
                {account.account_name && account.account_alias && <span>{account.account_name}</span>}
            </div>
        </div>
        {canManage && (
            <div className="account-row-actions">
                <button title="Editar" onClick={() => onEdit(account)}>
                    <Pencil size={14} />
                </button>
                <button title="Eliminar" className="remove-btn" onClick={() => onDelete(account.payment_account_id)}>
                    <Trash2 size={14} />
                </button>
            </div>
        )}
    </div>
);

// ── Panel de cuentas (cuerpo del modal) ───────────────────────────────────────
const AccountsPanel = ({ method, sucursalId, canManage, configurationPaymentId }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!sucursalId || !method?.db_id) return;
        setLoading(true);
        try {
            const res = await paymentAccountService.getByType(sucursalId, method.db_id);
            setAccounts(res?.data || []);
        } catch {
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    }, [sucursalId, method?.db_id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (editingAccount) {
                await paymentAccountService.update(editingAccount.payment_account_id, formData);
                toast.success('Cuenta actualizada');
            } else {
                formData.append('sucursal_id', sucursalId);
                formData.append('payment_type_id', method.db_id);
                // Enviar configuration_payment_id para vincular la cuenta con la configuración de pago
                if (configurationPaymentId) {
                    formData.append('configuration_payment_id', configurationPaymentId);
                }
                await paymentAccountService.create(formData);
                toast.success('Cuenta creada');
            }
            setShowForm(false);
            setEditingAccount(null);
            await load();
        } catch {
            toast.error('Error al guardar la cuenta');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta cuenta de pago?')) return;
        try {
            await paymentAccountService.delete(id);
            toast.success('Cuenta eliminada');
            await load();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAccount(null);
    };

    if (loading) return <p className="accounts-loading">Cargando cuentas...</p>;

    return (
        <div className="accounts-panel">
            {accounts.length === 0 && !showForm && (
                <p className="accounts-empty">Sin cuentas configuradas aún.</p>
            )}

            {accounts.map(acc =>
                editingAccount?.payment_account_id === acc.payment_account_id && showForm ? (
                    <AccountForm
                        key={acc.payment_account_id}
                        method={method}
                        initial={acc}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        saving={saving}
                    />
                ) : (
                    <AccountRow
                        key={acc.payment_account_id}
                        account={acc}
                        canManage={canManage}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )
            )}

            {showForm && !editingAccount && (
                <AccountForm
                    method={method}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saving={saving}
                />
            )}

            {canManage && !showForm && (
                <button
                    className="btn-add-account"
                    onClick={() => { setEditingAccount(null); setShowForm(true); }}
                >
                    <Plus size={14} /> Agregar cuenta
                </button>
            )}
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const PaymentMethodsFlow = ({
    company,
    subsidiaries,
    paymentMethods,
    selectedSubId,
    selectedSub,
    connectedMethods,
    isSavingPayments,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    onNodeClick,
    movePaymentItem,
    removePaymentMethod,
    saveActivePayments,
    canManage = false,
    canManageAccounts = false
}) => {
    const [modalMethod, setModalMethod] = useState(null);

    const initialNodes = useMemo(() => {
        const nodesList = [];
        const totalSubs = subsidiaries.length;
        const centerX = (totalSubs * 250) / 2 || 400;

        nodesList.push({
            id: 'company-main',
            type: 'input',
            data: {
                label: (
                    <div className="flow-node-company">
                        <Building2 size={20} />
                        <strong>{company?.name || 'Compañía'}</strong>
                    </div>
                )
            },
            position: { x: centerX, y: 0 },
            style: { background: '#f8fafc', border: '2px solid #6366f1', borderRadius: '8px', padding: '10px', width: 200 }
        });

        subsidiaries.forEach((subsidiary, index) => {
            const subId = `sub-${subsidiary.sucursal_id}`;
            const isSelected = selectedSubId === subId;
            nodesList.push({
                id: subId,
                className: `node-subsidiary ${isSelected ? 'selected' : ''}`,
                data: {
                    label: (
                        <div className="flow-node-subsidiary">
                            <strong>{subsidiary.name}</strong>
                            <p style={{ fontSize: '10px', margin: 0 }}>{subsidiary.address}</p>
                        </div>
                    )
                },
                position: { x: index * 250, y: 150 },
                style: { padding: '10px', width: 180 }
            });
        });

        const totalMethods = paymentMethods.length;
        paymentMethods.forEach((method, index) => {
            const methodId = `method-${method.id}`;
            const xPos = (centerX - ((totalMethods * 120) / 2)) + (index * 120);
            const Icon = method.icon;
            nodesList.push({
                id: methodId,
                type: 'output',
                data: {
                    label: (
                        <div className="flow-node-method" style={{ textAlign: 'center' }}>
                            <Icon size={18} color={method.color} />
                            <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>{method.label}</div>
                        </div>
                    )
                },
                position: { x: xPos, y: 350 },
                style: {
                    background: '#fff',
                    border: `2px solid ${method.color}`,
                    borderRadius: '12px',
                    width: 100, height: 80,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }
            });
        });

        return nodesList;
    }, [company, subsidiaries, selectedSubId, paymentMethods]);

    const initialEdges = useMemo(() => subsidiaries.map((subsidiary) => ({
        id: `e-company-sub-${subsidiary.sucursal_id}`,
        source: 'company-main',
        target: `sub-${subsidiary.sucursal_id}`,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#6366f1' }
    })), [subsidiaries]);

    useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);

    useEffect(() => {
        setEdges(prev => {
            const hasMethodEdges = prev.some(e => e.target.startsWith('method-'));
            if (hasMethodEdges) {
                return [...initialEdges, ...prev.filter(e => e.target.startsWith('method-'))];
            }
            return initialEdges;
        });
    }, [initialEdges, setEdges]);

    useEffect(() => { setModalMethod(null); }, [selectedSubId]);

    const sucursalIdRaw = selectedSubId?.replace('sub-', '');

    return (
        <section className='payment_methods animate-fade-in'>
            <div className="section-title">
                <h3><CreditCard size={18} /> Métodos de Pago por Sucursal</h3>
                <p>Visualiza y conecta los métodos de pago disponibles en cada sede.</p>
            </div>

            {!canManage && (
                <div className="warning-banner">
                    Solo puedes modificar el orden y las cuentas de pago. Para habilitar o deshabilitar tipos contacta al administrador del sistema.
                </div>
            )}

            <aside className='payment_flow'>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={canManage ? onEdgesChange : undefined}
                    onConnect={canManage ? onConnect : undefined}
                    onNodeClick={onNodeClick}
                    nodesConnectable={canManage}
                    edgesUpdatable={canManage}
                    fitView
                >
                    <Background variant="dots" gap={12} size={1} />
                    <Controls />
                    <MiniMap position="top-right" />
                </ReactFlow>
            </aside>

            {selectedSub && (
                <aside className="list_order">
                    <h3><ListOrdered size={18} /> Orden de visibilidad de pagos</h3>

                    <div className="selected-sub-info">
                        <div className="sub-header">
                            <h4>{selectedSub.name}</h4>
                            <span>{connectedMethods.length} métodos configurados</span>
                        </div>

                        {connectedMethods.length > 0 ? (
                            <>
                                <ul className="methods-sortable-list">
                                    {connectedMethods.map((method, index) => {
                                        const Icon = method.icon;
                                        return (
                                            <li key={method.edgeId} className="method-item-sortable">
                                                <div className="method-item-header">
                                                    <div
                                                        className="method-info"
                                                        onClick={() => setModalMethod(method)}
                                                        title="Configurar cuentas de pago"
                                                    >
                                                        <span className="method-order-badge">{index + 1}</span>
                                                        <Icon size={16} color={method.color} />
                                                        <span>{method.label}</span>
                                                        <Settings2 size={13} className="method-settings-icon" />
                                                    </div>
                                                    <div className="method-actions">
                                                        <button onClick={() => movePaymentItem(index, 'up')} disabled={index === 0} title="Subir">
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button onClick={() => movePaymentItem(index, 'down')} disabled={index === connectedMethods.length - 1} title="Bajar">
                                                            <ChevronDown size={16} />
                                                        </button>
                                                        {canManage && (
                                                            <button className="remove-btn" onClick={() => removePaymentMethod(method.edgeId)} title="Eliminar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <Button
                                    text={isSavingPayments ? 'Guardando...' : 'Guardar Cambios'}
                                    Icon={Save}
                                    onClick={saveActivePayments}
                                    loading={isSavingPayments}
                                    className='btnnn'
                                    disabled={isSavingPayments}
                                />
                            </>
                        ) : (
                            <div className="no-methods-msg">
                                <p>No hay métodos de pago conectados.</p>
                                <small>Arrastra una conexión desde la sucursal hacia un método de pago en el mapa.</small>
                            </div>
                        )}
                    </div>
                </aside>
            )}

            {/* Modal de cuentas — usa el shared Modal */}
            <Modal
                isOpen={!!modalMethod}
                onClose={() => setModalMethod(null)}
                title={modalMethod?.label || ''}
                Icon={modalMethod?.icon}
                size="medium"
                headerColor="default"
            >
                {modalMethod && (
                    <AccountsPanel
                        method={modalMethod}
                        sucursalId={sucursalIdRaw}
                        canManage={canManageAccounts}
                        configurationPaymentId={modalMethod?.configuration_payment_id}
                    />
                )}
            </Modal>
        </section>
    );
};

export default PaymentMethodsFlow;
